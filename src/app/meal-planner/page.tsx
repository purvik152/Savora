
'use client';

import { useState } from 'react';
import { ChefHat, CalendarDays } from 'lucide-react';
import { GoalBasedGeneratorForm } from '@/components/meal-planner/GoalBasedGeneratorForm';
import { RecipeResultDisplay } from '@/components/meal-planner/RecipeResultDisplay';
import { DietPlanForm } from '@/components/meal-planner/DietPlanForm';
import { WeeklyPlanDisplay } from '@/components/meal-planner/WeeklyPlanDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GenerateRecipeByGoalOutput } from '@/ai/flows/generate-recipe-by-goal-types';
import type { WeeklyPlan } from '@/ai/flows/generate-weekly-diet-plan-types';

export default function MealPlannerPage() {
  const [generatedRecipes, setGeneratedRecipes] = useState<GenerateRecipeByGoalOutput | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  const handlePlanChange = (newPlan: WeeklyPlan) => {
    setWeeklyPlan(newPlan);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
        <ChefHat className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">AI Meal Planner</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your personal AI chef for generating single recipes or creating full weekly diet plans.
        </p>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto h-12">
          <TabsTrigger value="generator" className="h-10 text-base">
            <ChefHat className="mr-2 h-5 w-5" /> Recipe Generator
          </TabsTrigger>
          <TabsTrigger value="planner" className="h-10 text-base">
            <CalendarDays className="mr-2 h-5 w-5" /> Weekly Planner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-1 lg:sticky lg:top-28 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <GoalBasedGeneratorForm onRecipeGenerated={setGeneratedRecipes} />
              </div>

              <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                 <RecipeResultDisplay result={generatedRecipes} />
              </div>
          </div>
        </TabsContent>

        <TabsContent value="planner" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
              <div className="lg:col-span-1 lg:sticky lg:top-28 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <DietPlanForm onPlanGenerated={setWeeklyPlan} setLoading={setIsPlanLoading}/>
              </div>
              <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  <WeeklyPlanDisplay 
                    plan={weeklyPlan} 
                    loading={isPlanLoading}
                    onPlanChange={handlePlanChange}
                   />
              </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
