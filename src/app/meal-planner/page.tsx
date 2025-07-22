
'use client';

import { useState } from 'react';
import { MealPlanner } from '@/components/meal-planner/MealPlanner';
import { SmartPlannerForm } from '@/components/meal-planner/SmartPlannerForm';
import { CalendarCheck, WandSparkles } from 'lucide-react';
import type { MealPlan } from '@/lib/meal-planner-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MealPlannerPage() {
  const [generatedPlan, setGeneratedPlan] = useState<MealPlan | null>(null);

  const handlePlanGenerated = (newPlan: MealPlan) => {
    setGeneratedPlan(newPlan);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-5xl mx-auto text-center mb-12 animate-fade-in-up">
        <CalendarCheck className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Weekly Meal Planner</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manually plan your meals or use our AI assistant to generate a plan based on your preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-28 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <WandSparkles className="text-primary" />
                AI Smart Planner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SmartPlannerForm onPlanGenerated={handlePlanGenerated} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
           <MealPlanner key={JSON.stringify(generatedPlan)} initialPlan={generatedPlan}/>
        </div>
      </div>
    </div>
  );
}
