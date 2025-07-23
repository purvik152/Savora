
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { generateWeeklyDietPlan } from '@/ai/flows/generate-weekly-diet-plan-flow';
import type { GenerateWeeklyDietPlanInput, WeeklyPlan } from '@/ai/flows/generate-weekly-diet-plan-types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, WandSparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDiet } from '@/contexts/DietContext';

const allergies = [
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'soy', label: 'Soy' },
] as const;

const formSchema = z.object({
  dietType: z.enum(['vegetarian', 'non-vegetarian', 'vegan']),
  dailyCalories: z.number().min(1200).max(4000),
  allergens: z.array(z.string()).optional(),
  maxCookingTime: z.number().optional(),
  dietGoal: z.enum(['weight-loss', 'muscle-gain', 'maintenance']),
});

type FormData = z.infer<typeof formSchema>;

interface DietPlanFormProps {
  onPlanGenerated: (plan: WeeklyPlan | null) => void;
  setLoading: (loading: boolean) => void;
}

export function DietPlanForm({ onPlanGenerated, setLoading }: DietPlanFormProps) {
  const { toast } = useToast();
  const [error, setError] = React.useState<string | null>(null);
  const { diet } = useDiet();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietType: diet === 'veg' ? 'vegetarian' : 'non-vegetarian',
      dailyCalories: 2000,
      allergens: [],
      maxCookingTime: 30,
      dietGoal: 'maintenance',
    },
  });

  const formValues = form.watch();

  async function onSubmit(values: FormData) {
    setLoading(true);
    setError(null);
    onPlanGenerated(null);

    const input: GenerateWeeklyDietPlanInput = {
      ...values,
      mealsPerDay: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    };

    try {
      const result = await generateWeeklyDietPlan(input);
      if (result) {
        onPlanGenerated(result);
        toast({
          title: "Meal Plan Generated!",
          description: "Your custom weekly plan is ready to view.",
        });
      } else {
        throw new Error("The AI chef couldn't generate a plan. Please adjust your criteria.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An AI error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <WandSparkles className="text-primary" />
          Plan Your Week
        </CardTitle>
        <CardDescription>Set your preferences and let AI do the heavy lifting.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="dietType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diet Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dietGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diet Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dailyCalories"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Daily Calorie Goal</FormLabel>
                        <span className="text-sm font-medium text-primary">{formValues.dailyCalories} kcal</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={1200} max={4000} step={50}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxCookingTime"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Max Cook Time</FormLabel>
                        <span className="text-sm font-medium text-primary">{formValues.maxCookingTime} mins</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={15} max={60} step={5}
                          value={[field.value || 30]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
            </div>

            <FormField
              control={form.control}
              name="allergens"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Allergen Warnings</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {allergies.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="allergens"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
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

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</>
              ) : (
                <><WandSparkles className="mr-2 h-4 w-4" /> Generate Plan</>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
                AI generation is a demo. It will create a random plan based on the recipes in the library.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
