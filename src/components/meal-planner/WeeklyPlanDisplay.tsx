
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, Eye, PlusCircle, Trash2 } from 'lucide-react';
import type { WeeklyPlan, DayPlan, Meal, Day } from '@/ai/flows/generate-weekly-diet-plan-types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AddRecipeDialog } from './AddRecipeDialog';
import { recipes as allRecipes, type Recipe } from '@/lib/recipes';

interface WeeklyPlanDisplayProps {
  plan: WeeklyPlan | null;
  loading: boolean;
  onPlanChange: (plan: WeeklyPlan) => void;
}

const daysOfWeek: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const mealSlots: (keyof DayPlan)[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const MealCard = ({ meal, onRemove }: { meal: Meal, onRemove: () => void }) => {
    const router = useRouter();
    const handleViewMeal = () => {
        // Find a full recipe object to pass to the detail page if possible
        const fullRecipe = allRecipes.find(r => r.title === meal.title);
        const recipeData = fullRecipe ? {
            ...fullRecipe
        } : {
            recipeName: meal.title,
            description: `A delicious ${meal.title}.`,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            nutrition: {
                calories: meal.calories,
                protein: 'N/A',
                carbs: 'N/A',
                fat: 'N/A'
            }
        };
        sessionStorage.setItem('generatedRecipe', JSON.stringify(recipeData));
        router.push('/meal-planner/recipe');
    };

    return (
        <Card className="h-full overflow-hidden group relative">
            <div className="relative h-24 w-full">
                <Image
                    src={meal.image || "https://placehold.co/300x200.png"}
                    alt={meal.title}
                    fill
                    className="object-cover"
                    data-ai-hint={meal.imageHint || "meal food"}
                    sizes="250px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Remove meal</span>
                </Button>
            </div>
            <CardContent className="p-3">
                <h4 className="font-bold text-sm leading-tight line-clamp-2">{meal.title}</h4>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <p>{meal.calories}</p>
                    <p>~{meal.prepTime}</p>
                </div>
                 <Button variant="ghost" size="sm" className="w-full justify-start p-0 h-auto mt-2 text-xs" onClick={handleViewMeal}>
                    <Eye className="h-3 w-3 mr-1" /> View
                </Button>
            </CardContent>
        </Card>
    );
};

const EmptyMealCard = ({ slot, onAdd }: { slot: string, onAdd: () => void }) => (
    <button onClick={onAdd} className="h-full w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary hover:border-primary hover:text-primary transition-all p-4">
        <p className="font-semibold text-sm mb-2">{slot}</p>
        <PlusCircle className="h-8 w-8" />
    </button>
);


export function WeeklyPlanDisplay({ plan, loading, onPlanChange }: WeeklyPlanDisplayProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{day: Day, slot: keyof DayPlan} | null>(null);

  const handleSave = () => {
    toast({
      title: "Plan Saved!",
      description: "Your weekly meal plan has been saved to your dashboard (simulation).",
    });
  };
  
  const handleRegenerate = () => {
    toast({
      title: "Coming Soon!",
      description: "The ability to regenerate your plan is on its way.",
    });
  };

  const openAddDialog = (day: Day, slot: keyof DayPlan) => {
    setSelectedSlot({ day, slot });
    setAddDialogOpen(true);
  };
  
  const handleAddRecipe = (recipe: Recipe) => {
    if (!selectedSlot || !plan) return;
    const { day, slot } = selectedSlot;

    const newMeal: Meal = {
        title: recipe.title,
        calories: recipe.nutrition.calories,
        prepTime: recipe.prepTime,
        image: recipe.image,
        imageHint: recipe.imageHint,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
    };

    const newPlan: WeeklyPlan = {
      ...plan,
      [day]: {
        ...plan[day],
        [slot]: newMeal
      }
    };
    onPlanChange(newPlan);
  };

  const handleRemoveMeal = (day: Day, slot: keyof DayPlan) => {
     if (!plan) return;
     const newPlan: WeeklyPlan = {
      ...plan,
      [day]: {
        ...plan[day],
        [slot]: undefined,
      }
    };
    onPlanChange(newPlan);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-40 w-48" />
                <Skeleton className="h-40 w-48" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="p-12 text-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Your custom meal plan will appear here.</p>
            <p className="text-sm text-muted-foreground">Fill out the form to the left to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" onClick={handleRegenerate}><RefreshCw className="h-4 w-4 mr-2" />Regenerate</Button>
            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Plan</Button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap rounded-lg">
          <div className="flex space-x-4 pb-4">
            {daysOfWeek.map((day) => (
                <div key={day} className="flex-none w-56 space-y-3">
                    <h3 className="font-bold text-lg text-center">{day}</h3>
                    {mealSlots.map(slot => {
                        const meal = plan[day]?.[slot];
                        return meal ? (
                            <MealCard key={`${day}-${slot}`} meal={meal} onRemove={() => handleRemoveMeal(day, slot)} />
                        ) : (
                            <EmptyMealCard key={`${day}-${slot}`} slot={slot} onAdd={() => openAddDialog(day, slot)} />
                        )
                    })}
                </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
     <AddRecipeDialog
        open={isAddDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddRecipe={handleAddRecipe}
      />
    </>
  );
}
