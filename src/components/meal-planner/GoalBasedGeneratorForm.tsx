'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { generateRecipeByGoal } from '@/ai/flows/generate-recipe-by-goal-flow';
import type { GenerateRecipeByGoalInput, GenerateRecipeByGoalOutput } from '@/ai/flows/generate-recipe-by-goal-types';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, WandSparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  calories: z.number().min(300).max(1500),
  macroFocus: z.enum(['High Protein', 'Low Carb', 'Balanced']),
  allergies: z.string().optional(),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  time: z.number().min(5).max(120),
});

type FormData = z.infer<typeof formSchema>;

interface GoalBasedGeneratorFormProps {
  onRecipeGenerated: (recipe: GenerateRecipeByGoalOutput | null) => void;
}

export function GoalBasedGeneratorForm({ onRecipeGenerated }: GoalBasedGeneratorFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calories: 700,
      macroFocus: 'Balanced',
      allergies: '',
      mealType: 'Lunch',
      time: 30,
    },
  });

  const formValues = form.watch();

  async function onSubmit(values: FormData) {
    setLoading(true);
    setError(null);
    onRecipeGenerated(null);

    const input: GenerateRecipeByGoalInput = {
      ...values,
      allergies: values.allergies ? values.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
    };

    try {
      const result = await generateRecipeByGoal(input);
      if (result) {
        onRecipeGenerated(result);
        toast({
          title: "Recipe Generated!",
          description: "Your custom recipe is ready.",
        });
      } else {
        throw new Error("The AI chef couldn't come up with a recipe. Please adjust your criteria.");
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
          AI Recipe Generator
        </CardTitle>
        <CardDescription>Define your goals and let our AI create a recipe for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="calories"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Calories</FormLabel>
                    <span className="text-sm font-medium text-primary">{formValues.calories} kcal</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={300} max={1500} step={50}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="macroFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Macro Focus</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High Protein">High Protein</SelectItem>
                      <SelectItem value="Low Carb">Low Carb</SelectItem>
                      <SelectItem value="Balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Max Time</FormLabel>
                    <span className="text-sm font-medium text-primary">{formValues.time} mins</span>
                  </div>
                  <FormControl>
                    <Slider
                      min={5} max={120} step={5}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><WandSparkles className="mr-2 h-4 w-4" /> Generate Recipe</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
