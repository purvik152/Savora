
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Flame, Utensils, Zap, HeartPulse } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { SingleRecipe } from '@/ai/flows/generate-recipe-by-goal-types';

function MealDetailsView({ meal }: { meal: SingleRecipe }) {
  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="p-0 relative h-64 md:h-96">
            <Image
              src={"https://placehold.co/600x400.png"}
              alt={meal.recipeName}
              fill
              className="object-cover"
              sizes="100vw"
              data-ai-hint="meal food"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <Badge variant="secondary" className="mb-2">AI Generated Recipe</Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{meal.recipeName}</h1>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                      <HeartPulse className="h-8 w-8 text-primary mb-2 mx-auto" />
                      <span className="font-bold">Calories</span>
                      <span className="text-muted-foreground block">{meal.nutrition.calories}</span>
                  </div>
                   <div className="p-4 bg-secondary/50 rounded-lg">
                      <Flame className="h-8 w-8 text-primary mb-2 mx-auto" />
                      <span className="font-bold">Protein</span>
                      <span className="text-muted-foreground block">{meal.nutrition.protein}</span>
                   </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <Utensils className="h-8 w-8 text-primary mb-2 mx-auto" />
                        <span className="font-bold">Carbs</span>
                        <span className="text-muted-foreground block">{meal.nutrition.carbs}</span>
                    </div>
                     <div className="p-4 bg-secondary/50 rounded-lg">
                        <Zap className="h-8 w-8 text-primary mb-2 mx-auto" />
                        <span className="font-bold">Fat</span>
                        <span className="text-muted-foreground block">{meal.nutrition.fat}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
                        <ul className="space-y-3">
                        {meal.ingredients.map((ingredient, index) => (
                            <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <span>{ingredient}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
                        <ol className="space-y-4">
                            {meal.instructions.map((step, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
                                    <p className="flex-1 text-base text-foreground/90">{step}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MealPlannerRecipeContent() {
  const [meal, setMeal] = useState<SingleRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This code runs only on the client
    const mealJson = sessionStorage.getItem('generatedRecipe');

    if (mealJson) {
      try {
        setMeal(JSON.parse(mealJson));
      } catch (error) {
        console.error("Failed to parse recipe data from sessionStorage", error);
        router.push('/meal-planner');
      }
    } else {
      // If there's no recipe data, redirect back to the planner
      router.push('/meal-planner');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <Skeleton className="h-screen w-full" />;
  }
  
  if (!meal) {
    // This will be brief as the redirect will happen quickly, or notFound() will be called
    notFound();
    return null;
  }

  return <MealDetailsView meal={meal} />;
}

export default function MealPlannerRecipePage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <MealPlannerRecipeContent />
    </Suspense>
  );
}

