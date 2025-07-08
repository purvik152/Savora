'use client';

import { useState, useMemo } from 'react';
import { recipes as allRecipes, Recipe } from '@/lib/recipes';
import { useDiet } from '@/contexts/DietContext';
import { MoodSelector } from '@/components/mood-kitchen/MoodSelector';
import { getMoodBasedSuggestions, MoodBasedSuggestionsOutput } from '@/ai/flows/mood-based-suggestions-flow';
import { WandSparkles, Bot, Loader2 } from 'lucide-react';
import { SuggestionCard } from '@/components/mood-kitchen/SuggestionCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MoodKitchenPage() {
  const { diet } = useDiet();
  const [suggestions, setSuggestions] = useState<MoodBasedSuggestionsOutput['suggestions']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const activeRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
        if (diet === 'veg') return recipe.diet === 'veg';
        if (diet === 'non-veg') return recipe.diet === 'non-veg';
        return true;
    }).map(({ slug, title, description }) => ({ slug, title, description }));
  }, [diet]);

  const handleSelectMood = async (mood: string) => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSelectedMood(mood);
    
    try {
      const result = await getMoodBasedSuggestions({
        mood,
        diet,
        recipes: activeRecipes,
      });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        setError("I couldn't find any suggestions for that mood right now. Please try another.");
      }
    } catch (e) {
      console.error(e);
      setError("An AI error occurred. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <WandSparkles className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Mood Kitchen</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          How are you feeling today? Let Savora find the perfect recipes to match your mood.
        </p>
      </div>

      <MoodSelector onSelectMood={handleSelectMood} disabled={loading} selectedMood={selectedMood} />

      <div className="mt-16">
        {loading && (
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-semibold">Savora is thinking...</p>
            <p className="text-sm text-muted-foreground">Finding the perfect recipes for a '{selectedMood?.toLowerCase()}' mood.</p>
          </div>
        )}

        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <Bot className="h-4 w-4" />
                <AlertTitle>Suggestion Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {suggestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {suggestions.map(({ slug, reason }) => {
              const recipe = allRecipes.find(r => r.slug === slug);
              if (!recipe) return null;
              return <SuggestionCard key={slug} recipe={recipe} reason={reason} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
