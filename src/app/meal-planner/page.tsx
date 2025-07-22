
'use client';

import { useState } from 'react';
import { ChefHat, Bot } from 'lucide-react';
import { GoalBasedGeneratorForm } from '@/components/meal-planner/GoalBasedGeneratorForm';
import { RecipeResultDisplay } from '@/components/meal-planner/RecipeResultDisplay';
import type { GenerateRecipeByGoalOutput } from '@/ai/flows/generate-recipe-by-goal-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartPlannerForm } from '@/components/meal-planner/SmartPlannerForm';
import { MealPlanner } from '@/components/meal-planner/MealPlanner';
import type { MealPlan } from '@/lib/meal-planner-data';

export default function MealPlannerPage() {
  const [generatedRecipes, setGeneratedRecipes] = useState<GenerateRecipeByGoalOutput | null>(null);
  const [aiMealPlan, setAiMealPlan] = useState<MealPlan | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
        <ChefHat className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Meal Planner</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Organize your week, create custom recipes based on your goals, or let our AI build a plan for you.
        </p>
      </div>
      
      <Tabs defaultValue="weekly-plan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:max-w-md md:mx-auto">
          <TabsTrigger value="weekly-plan">📅 Weekly Plan</TabsTrigger>
          <TabsTrigger value="generator">🤖 AI Recipe Generator</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly-plan" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                <div className="lg:col-span-1 lg:sticky lg:top-28 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <SmartPlannerForm onPlanGenerated={setAiMealPlan} />
                </div>
                 <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <MealPlanner initialPlan={aiMealPlan} />
                </div>
            </div>
        </TabsContent>
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
      </Tabs>
    </div>
  );
}
