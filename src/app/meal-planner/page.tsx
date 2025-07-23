
'use client';

import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { GoalBasedGeneratorForm } from '@/components/meal-planner/GoalBasedGeneratorForm';
import { RecipeResultDisplay } from '@/components/meal-planner/RecipeResultDisplay';
import type { GenerateRecipeByGoalOutput } from '@/ai/flows/generate-recipe-by-goal-types';

export default function MealPlannerPage() {
  const [generatedRecipes, setGeneratedRecipes] = useState<GenerateRecipeByGoalOutput | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
        <ChefHat className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">AI Recipe Generator</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Define your health goals, and let our AI create delicious, custom recipes just for you.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1 lg:sticky lg:top-28 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <GoalBasedGeneratorForm onRecipeGenerated={setGeneratedRecipes} />
          </div>

          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
             <RecipeResultDisplay result={generatedRecipes} />
          </div>
      </div>
    </div>
  );
}
