'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Flame, Utensils, Zap, HeartPulse } from 'lucide-react';
import type { GenerateRecipeByGoalOutput, SingleRecipe } from '@/ai/flows/generate-recipe-by-goal-types';

interface RecipeResultDisplayProps {
  result: GenerateRecipeByGoalOutput | null;
}

function SingleRecipeCard({ recipe }: { recipe: SingleRecipe }) {
  const { recipeName, description, ingredients, instructions, nutrition } = recipe;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{recipeName}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
            <div className="p-3 bg-secondary/50 rounded-lg">
                <HeartPulse className="h-6 w-6 text-primary mb-1 mx-auto" />
                <span className="font-bold text-sm">Calories</span>
                <span className="text-muted-foreground block text-xs">{nutrition.calories}</span>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
                <Flame className="h-6 w-6 text-primary mb-1 mx-auto" />
                <span className="font-bold text-sm">Protein</span>
                <span className="text-muted-foreground block text-xs">{nutrition.protein}</span>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
                <Utensils className="h-6 w-6 text-primary mb-1 mx-auto" />
                <span className="font-bold text-sm">Carbs</span>
                <span className="text-muted-foreground block text-xs">{nutrition.carbs}</span>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
                <Zap className="h-6 w-6 text-primary mb-1 mx-auto" />
                <span className="font-bold text-sm">Fat</span>
                <span className="text-muted-foreground block text-xs">{nutrition.fat}</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <h3 className="text-lg font-bold mb-3">Ingredients</h3>
                <ul className="space-y-2 text-sm">
                    {ingredients.map((ing, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{ing}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2">
                <h3 className="text-lg font-bold mb-3">Instructions</h3>
                <ol className="space-y-3 text-sm">
                    {instructions.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs mt-0.5">{index + 1}</div>
                            <p className="flex-1 text-foreground/90">{step}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}


export function RecipeResultDisplay({ result }: RecipeResultDisplayProps) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Custom Recipes Will Appear Here</CardTitle>
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

  return (
    <div className="space-y-8">
      {result.recipes.map((recipe, index) => (
        <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
            <SingleRecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  );
}
