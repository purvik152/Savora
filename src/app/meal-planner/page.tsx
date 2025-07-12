'use client';

import { useState } from 'react';
import { MealPlanner } from '@/components/meal-planner/MealPlanner';
import { SmartPlannerForm } from '@/components/meal-planner/SmartPlannerForm';
import { CalendarCheck, WandSparkles } from 'lucide-react';
import type { MealPlan } from '@/lib/meal-planner-data';

export default function MealPlannerPage() {
  // Add state to hold the AI-generated plan and pass it down
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);

  const handlePlanGenerated = (newPlan: MealPlan) => {
    // This key forces the MealPlanner component to re-mount and re-fetch its state
    // from localStorage, ensuring it displays the new AI-generated plan.
    setGeneratedPlan(newPlan);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <CalendarCheck className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Weekly Meal Planner</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manually plan your meals or use our AI assistant to generate a plan based on your preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-1">
            <div className="sticky top-24">
                 <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <WandSparkles className="text-primary" />
                    AI Smart Planner
                </h2>
                <SmartPlannerForm onPlanGenerated={handlePlanGenerated} />
            </div>
        </div>
        <div className="lg:col-span-2">
           <MealPlanner key={JSON.stringify(generatedPlan)} initialPlan={generatedPlan}/>
        </div>
      </div>
    </div>
  );
}
