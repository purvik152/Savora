
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, Eye } from 'lucide-react';
import type { WeeklyPlan, DayPlan, Meal } from '@/ai/flows/generate-weekly-diet-plan-flow';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface WeeklyPlanDisplayProps {
  plan: WeeklyPlan | null;
  loading: boolean;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealSlots: (keyof DayPlan)[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];

function MealCard({ meal }: { meal: Meal }) {
  const router = useRouter();

  const handleViewMeal = () => {
    // A simplified object for display purposes on the detail page
    const mealDetails = {
      title: meal.title,
      image: meal.image || 'https://placehold.co/300x200.png',
      prepTime: meal.prepTime,
      calories: meal.calories,
      ingredients: meal.ingredients,
      instructions: meal.instructions
    };
    sessionStorage.setItem('mealDetails', JSON.stringify(mealDetails));
    router.push('/meal-planner/recipe');
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden group">
        <div className="relative h-24 w-full">
             <Image 
                src={meal.image || "https://placehold.co/300x200.png"} 
                alt={meal.title}
                fill
                className="object-cover"
                data-ai-hint="meal food"
                sizes="(max-width: 768px) 100vw, 33vw"
             />
             <div className="absolute inset-0 bg-black/20" />
        </div>
        <CardContent className="p-3 flex-grow flex flex-col">
            <h4 className="font-bold text-sm leading-tight line-clamp-2 flex-grow">{meal.title}</h4>
            <div className="text-xs text-muted-foreground mt-1">
                <p>{meal.calories}</p>
                <p>{meal.prepTime}</p>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-start p-1 h-auto mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleViewMeal}>
              <Eye className="h-3 w-3 mr-1" /> View Details
            </Button>
        </CardContent>
    </Card>
  )
}

export function WeeklyPlanDisplay({ plan, loading }: WeeklyPlanDisplayProps) {
  const { toast } = useToast();

  const handleSave = () => {
    // Mock save functionality
    toast({
      title: "Plan Saved!",
      description: "Your weekly meal plan has been saved to your dashboard.",
    });
  };
  
  const handleRegenerate = () => {
    // Mock regenerate functionality
    toast({
      title: "Coming Soon!",
      description: "The ability to regenerate your plan is on its way.",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(28)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Custom Meal Plan Will Appear Here</CardTitle>
          <CardDescription>Fill out the form to the left to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-12 text-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Waiting for your preferences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Your Generated 7-Day Plan</CardTitle>
          <CardDescription>Here is the personalized plan created by Savora AI.</CardDescription>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleRegenerate}><RefreshCw className="h-4 w-4 mr-2" />Regenerate</Button>
            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Plan</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 bg-muted p-1 rounded-lg">
            {daysOfWeek.map(day => (
                <div key={day} className="text-center font-bold text-sm py-2">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2 mt-2">
          {daysOfWeek.map((day) => (
              <div key={day} className="space-y-2">
                {mealSlots.map(mealSlot => {
                  const meal = plan[day as keyof WeeklyPlan]?.[mealSlot];
                  return meal ? (
                     <MealCard key={`${day}-${mealSlot}`} meal={meal} />
                  ) : (
                    <div key={`${day}-${mealSlot}`} className="h-32 border-dashed border-2 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">{mealSlot}</span>
                    </div>
                  )
                })}
              </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
