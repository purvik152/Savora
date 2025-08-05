
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const moods = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Sad', emoji: '😢' },
  { name: 'Stressed', emoji: '😫' },
  { name: 'Energetic', emoji: '⚡️' },
  { name: 'Cozy', emoji: '😌' },
  { name: 'Romantic', emoji: '❤️' },
];

interface MoodSelectorProps {
  onSelectMood: (mood: string) => void;
  disabled: boolean;
  selectedMood: string | null;
}

export function MoodSelector({ onSelectMood, disabled, selectedMood }: MoodSelectorProps) {
  return (
    <Card className="p-6 md:p-8 bg-card/50">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {moods.map((mood) => (
          <Button
            key={mood.name}
            variant="outline"
            className={cn(
              "flex flex-col h-24 gap-2 text-lg font-semibold transition-all duration-200 ease-in-out hover:scale-105 hover:bg-primary/10",
              selectedMood === mood.name && "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            )}
            onClick={() => onSelectMood(mood.name)}
            disabled={disabled}
          >
            <span className="text-4xl">{mood.emoji}</span>
            {mood.name}
          </Button>
        ))}
      </div>
    </Card>
  );
}
