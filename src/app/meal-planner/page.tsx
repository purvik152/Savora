
'use client';

import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { DietPlanForm } from '@/components/meal-planner/DietPlanForm';
import { WeeklyPlanDisplay } from '@/components/meal-planner/WeeklyPlanDisplay';
import type { WeeklyPlan } from '@/ai/flows/generate-weekly-diet-plan-flow';

export default function MealPlannerPage() {
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
        <ChefHat className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Personalized Weekly Diet Plan</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell us your goals, and let our AI create a delicious, tailored meal plan for your entire week.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          <div className="lg:col-span-1 lg:sticky lg:top-28 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <DietPlanForm onPlanGenerated={setGeneratedPlan} setLoading={setLoading} />
          </div>

          <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
             <WeeklyPlanDisplay plan={generatedPlan} loading={loading} />
          </div>
      </div>
    </div>
  );
}
