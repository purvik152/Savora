'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MealPlan, getMealPlan, saveMealPlan, MealSlot } from '@/lib/meal-planner-data';
import type { Recipe } from '@/lib/recipes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle, Trash2, Loader2, BarChart2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AddRecipeDialog } from './AddRecipeDialog';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const daysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const initialMealPlan: MealPlan = daysOfWeek.reduce((acc, day) => {
  acc[day] = { Breakfast: null, Lunch: null, Dinner: null };
  return acc;
}, {} as MealPlan);

const chartConfig = {
  calories: { label: 'Calories', color: 'hsl(var(--chart-1))' },
  protein: { label: 'Protein (g)', color: 'hsl(var(--chart-2))' },
  carbs: { label: 'Carbs (g)', color: 'hsl(var(--chart-3))' },
  fat: { label: 'Fat (g)', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

export function MealPlanner() {
  const [hasMounted, setHasMounted] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan>(initialMealPlan);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; meal: MealSlot } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setHasMounted(true);
    const storedUser = localStorage.getItem('savora-user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const savedPlan = getMealPlan();
    if (savedPlan) {
      // Ensure all days are present
      const fullPlan = { ...initialMealPlan, ...savedPlan };
      setMealPlan(fullPlan);
    }
  }, [router]);

  const updateMealPlan = (newPlan: MealPlan) => {
    setMealPlan(newPlan);
    saveMealPlan(newPlan);
  };

  const handleOpenDialog = (day: string, meal: MealSlot) => {
    setSelectedSlot({ day, meal });
    setIsDialogOpen(true);
  };

  const handleAddRecipe = (recipe: Recipe) => {
    if (!selectedSlot) return;
    const { day, meal } = selectedSlot;
    const newPlan = { ...mealPlan };
    newPlan[day][meal] = recipe;
    updateMealPlan(newPlan);
  };

  const handleRemoveRecipe = (day: string, meal: MealSlot) => {
    const newPlan = { ...mealPlan };
    newPlan[day][meal] = null;
    updateMealPlan(newPlan);
  };

  const handleClearWeek = () => {
    updateMealPlan(initialMealPlan);
    toast({ title: 'Meal plan cleared!' });
  };

  const dailyTotals = useMemo(() => {
    return daysOfWeek.map(day => {
      const dayPlan = mealPlan[day];
      let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      (Object.values(dayPlan) as (Recipe | null)[]).forEach(recipe => {
        if (recipe) {
          totals.calories += parseInt(recipe.nutrition.calories, 10) || 0;
          totals.protein += parseInt(recipe.nutrition.protein, 10) || 0;
          totals.carbs += parseInt(recipe.nutrition.carbohydrates, 10) || 0;
          totals.fat += parseInt(recipe.nutrition.fat, 10) || 0;
        }
      });
      return totals;
    });
  }, [mealPlan]);

  const nutritionChartData = useMemo(() => {
    return daysOfWeek.map((day, index) => ({
      day: day.substring(0, 3),
      ...dailyTotals[index],
    }));
  }, [dailyTotals]);

  if (!hasMounted) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderMealSlot = (day: string, meal: MealSlot) => {
    const recipe = mealPlan[day]?.[meal];
    return (
      <div className="h-full">
        <h4 className="font-semibold text-sm text-muted-foreground mb-2">{meal}</h4>
        {recipe ? (
          <Card className="group relative h-full flex flex-col">
            <Link href={`/recipes/${recipe.slug}`} className="block">
              <Image
                src={recipe.image}
                alt={recipe.title}
                width={200}
                height={120}
                className="w-full h-24 object-cover rounded-t-lg"
                data-ai-hint={recipe.imageHint}
              />
            </Link>
            <CardContent className="p-2 flex-grow">
              <Link href={`/recipes/${recipe.slug}`} className="block">
                <p className="text-xs font-semibold leading-tight line-clamp-2 hover:underline">{recipe.title}</p>
              </Link>
            </CardContent>
            <button
              onClick={() => handleRemoveRecipe(day, meal)}
              className="absolute top-1 right-1 bg-background/70 text-destructive rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </Card>
        ) : (
          <button
            onClick={() => handleOpenDialog(day, meal)}
            className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary hover:border-solid hover:border-primary transition-all"
          >
            <PlusCircle className="h-6 w-6 mb-1" />
            <span className="text-xs">Add Recipe</span>
          </button>
        )}
      </div>
    );
  };
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleClearWeek} variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Clear Week
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center font-bold p-2 bg-card rounded-t-lg">{day}</div>
        ))}
        {daysOfWeek.map(day => (
          <div key={`${day}-B`} className="bg-card p-2 h-48">{renderMealSlot(day, 'Breakfast')}</div>
        ))}
        {daysOfWeek.map(day => (
          <div key={`${day}-L`} className="bg-card p-2 h-48">{renderMealSlot(day, 'Lunch')}</div>
        ))}
        {daysOfWeek.map(day => (
          <div key={`${day}-D`} className="bg-card p-2 h-48">{renderMealSlot(day, 'Dinner')}</div>
        ))}
        {dailyTotals.map((totals, index) => (
          <div key={`${daysOfWeek[index]}-totals`} className="bg-card p-2 rounded-b-lg text-xs text-muted-foreground">
             <p><strong>Cals:</strong> {totals.calories}</p>
             <p><strong>P:</strong> {totals.protein}g</p>
             <p><strong>C:</strong> {totals.carbs}g</p>
             <p><strong>F:</strong> {totals.fat}g</p>
          </div>
        ))}
      </div>
      
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 />
            Weekly Nutrition Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
           <ChartContainer config={chartConfig} className="w-full h-[400px]">
            <BarChart data={nutritionChartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="calories" stackId="a" fill="var(--color-calories)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="protein" stackId="a" fill="var(--color-protein)" />
              <Bar dataKey="carbs" stackId="a" fill="var(--color-carbs)" />
              <Bar dataKey="fat" stackId="a" fill="var(--color-fat)" />
            </BarChart>
           </ChartContainer>
        </CardContent>
      </Card>

      <AddRecipeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddRecipe={handleAddRecipe}
      />
    </>
  );
}
