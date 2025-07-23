
'use client';

import { notFound, useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, Check } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

// This is a simplified interface for display purposes.
// The full data would be passed from the meal planner.
interface MealDetails {
  title: string;
  image: string;
  prepTime: string;
  calories: string;
  ingredients: string[];
  instructions: string[];
}

function MealDetailsView({ meal }: { meal: MealDetails }) {
  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="p-0 relative h-64 md:h-96">
            <Image
              src={meal.image || "https://placehold.co/600x400.png"}
              alt={meal.title}
              fill
              className="object-cover"
              sizes="100vw"
              data-ai-hint="meal food"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <Badge variant="secondary" className="mb-2">AI Generated Meal</Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{meal.title}</h1>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-center">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                      <Clock className="h-8 w-8 text-primary mb-2 mx-auto" />
                      <span className="font-bold">Prep Time</span>
                      <span className="text-muted-foreground block">{meal.prepTime}</span>
                  </div>
                   <div className="p-4 bg-secondary/50 rounded-lg">
                      <Flame className="h-8 w-8 text-primary mb-2 mx-auto" />
                      <span className="font-bold">Calories</span>
                      <span className="text-muted-foreground block">{meal.calories}</span>
                   </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <Users className="h-8 w-8 text-primary mb-2 mx-auto" />
                        <span className="font-bold">Servings</span>
                        <span className="text-muted-foreground block">1 person</span>
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


export default function MealPlannerRecipePage() {
  const [meal, setMeal] = useState<MealDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This code runs only on the client
    const mealJson = sessionStorage.getItem('mealDetails');

    if (mealJson) {
      setMeal(JSON.parse(mealJson));
    } else {
      // If there's no recipe data, redirect back to the planner
      router.push('/meal-planner');
    }
    setLoading(false);
  }, [router, searchParams]);

  if (loading) {
    return <Skeleton className="h-screen w-full" />;
  }
  
  if (!meal) {
    // This will be brief as the redirect will happen quickly
    return null;
  }

  return <MealDetailsView meal={meal} />;
}
