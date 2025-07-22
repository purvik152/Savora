'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Flame, Utensils, Zap, HeartPulse } from 'lucide-react';
import type { GenerateRecipeByGoalOutput } from '@/ai/flows/generate-recipe-by-goal-types';

interface RecipeResultDisplayProps {
  recipe: GenerateRecipeByGoalOutput | null;
}

export function RecipeResultDisplay({ recipe }: RecipeResultDisplayProps) {
  if (!recipe) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Custom Recipe Will Appear Here</CardTitle>
          <CardDescription>Fill out the form to the left to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
          <div className="space-y-4 mt-6">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { recipeName, description, ingredients, instructions, nutrition } = recipe;

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-3xl">{recipeName}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
            <div className="p-4 bg-secondary/50 rounded-lg">
                <HeartPulse className="h-8 w-8 text-primary mb-2 mx-auto" />
                <span className="font-bold">Calories</span>
                <span className="text-muted-foreground block">{nutrition.calories}</span>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <Flame className="h-8 w-8 text-primary mb-2 mx-auto" />
                <span className="font-bold">Protein</span>
                <span className="text-muted-foreground block">{nutrition.protein}</span>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <Utensils className="h-8 w-8 text-primary mb-2 mx-auto" />
                <span className="font-bold">Carbs</span>
                <span className="text-muted-foreground block">{nutrition.carbs}</span>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <Zap className="h-8 w-8 text-primary mb-2 mx-auto" />
                <span className="font-bold">Fat</span>
                <span className="text-muted-foreground block">{nutrition.fat}</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <h3 className="text-xl font-bold mb-4">Ingredients</h3>
                <ul className="space-y-3">
                    {ingredients.map((ing, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <span>{ing}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-4">Instructions</h3>
                <ol className="space-y-4">
                    {instructions.map((step, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
                            <p className="flex-1 text-base text-foreground/90">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
