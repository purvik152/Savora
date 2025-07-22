
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface SmartPlannerFormProps {
    onPlanGenerated: (plan: any) => void;
}

export function SmartPlannerForm({ onPlanGenerated }: SmartPlannerFormProps) {
  // This is a placeholder for a more complex AI form.
  // The logic for generating a full week's plan would go here.
  const handleGenerateClick = () => {
    // In a real implementation, this would call an AI flow.
    // For now, it just informs the user.
    alert("AI weekly plan generation is a feature coming soon!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot />
            AI Smart Planner
        </CardTitle>
        <CardDescription>
            Let our AI generate a full week's meal plan based on your preferences. (Coming Soon)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerateClick} className="w-full" disabled>
          Generate My Weekly Plan
        </Button>
      </CardContent>
    </Card>
  );
}
