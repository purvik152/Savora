import { MealPlanner } from '@/components/meal-planner/MealPlanner';
import { CalendarCheck } from 'lucide-react';

export default function MealPlannerPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <CalendarCheck className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Weekly Meal Planner</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Plan your meals for the week, track your nutrition, and stay on top of your health goals. Add recipes to each slot to get started.
        </p>
      </div>
      <MealPlanner />
    </div>
  );
}
