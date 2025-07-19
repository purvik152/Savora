
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDiet } from '@/contexts/DietContext';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { recipes as allRecipes, Recipe } from '@/lib/recipes';
import { generateMealPlan, GenerateMealPlanInput, GenerateMealPlanOutput } from '@/ai/flows/generate-meal-plan-flow';
import type { MealPlan } from '@/lib/meal-planner-data';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  targetCalories: z.number().min(1000).max(4000),
  allergies: z.string().optional(),
  maxPrepTime: z.number().min(5).max(120),
});

interface SmartPlannerFormProps {
  onPlanGenerated: (plan: MealPlan) => void;
}

export function SmartPlannerForm({ onPlanGenerated }: SmartPlannerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { diet } = useDiet();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetCalories: 2000,
      allergies: '',
      maxPrepTime: 45,
    },
  });
  
  const formValues = form.watch();

  const availableRecipes = useMemo(() => {
    return allRecipes
      .filter(recipe => {
        if (diet === 'veg') return recipe.diet === 'veg';
        if (diet === 'non-veg') return recipe.diet === 'non-veg';
        return true;
      })
      .map(({ slug, title, category, nutrition, prepTime, allergens }) => ({
        slug,
        title,
        category,
        calories: nutrition.calories,
        prepTime,
        allergens,
      }));
  }, [diet]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please Log In',
        description: 'You need to be logged in to generate a meal plan.',
      });
      return;
    }

    setLoading(true);
    setError(null);

    const input: GenerateMealPlanInput = {
      diet,
      targetCalories: values.targetCalories,
      allergies: values.allergies ? values.allergies.split(',').map(a => a.trim().toLowerCase()) : [],
      maxPrepTime: values.maxPrepTime,
      recipes: availableRecipes,
    };
    
    try {
        const result = await generateMealPlan(input);
        
        if (!result) {
            throw new Error("The AI returned an empty plan. Please adjust your criteria.");
        }

        // Convert the AI output (recipe slugs) into a full MealPlan object
        const newMealPlan: MealPlan = Object.entries(result).reduce((acc, [day, meals]) => {
            const dayPlan: { Breakfast: Recipe | null, Lunch: Recipe | null, Dinner: Recipe | null } = {
                Breakfast: null,
                Lunch: null,
                Dinner: null
            };
            if (meals.Breakfast) {
                dayPlan.Breakfast = allRecipes.find(r => r.slug === meals.Breakfast) || null;
            }
            if (meals.Lunch) {
                dayPlan.Lunch = allRecipes.find(r => r.slug === meals.Lunch) || null;
            }
            if (meals.Dinner) {
                dayPlan.Dinner = allRecipes.find(r => r.slug === meals.Dinner) || null;
            }
            acc[day] = dayPlan;
            return acc;
        }, {} as MealPlan);
        
        onPlanGenerated(newMealPlan);
        toast({
            title: "Meal Plan Generated!",
            description: "Your new weekly meal plan is ready.",
        });

    } catch (e: any) {
        console.error(e);
        setError(e.message || "An AI error occurred. Please try again in a moment.");
    } finally {
        setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="targetCalories"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Target Daily Calories</FormLabel>
                    <span className="text-sm font-medium text-primary">{formValues.targetCalories} kcal</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={1000}
                      max={4000}
                      step={100}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="maxPrepTime"
              render={({ field }) => (
                <FormItem>
                   <div className="flex justify-between items-center">
                        <FormLabel>Max Prep Time per Meal</FormLabel>
                        <span className="text-sm font-medium text-primary">{formValues.maxPrepTime} mins</span>
                   </div>
                  <FormControl>
                    <Slider
                      min={5}
                      max={120}
                      step={5}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies to Avoid</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., nuts, dairy, gluten" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Generation Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate My Plan
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
