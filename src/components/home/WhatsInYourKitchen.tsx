
'use client';

import { useState, useMemo } from 'react';
import { recipes as allRecipes, Recipe } from '@/lib/recipes';
import { useDiet } from '@/contexts/DietContext';
import { getSuggestionsByIngredients, SuggestByIngredientsOutput } from '@/ai/flows/suggest-by-ingredients-flow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SuggestionCard } from '@/components/mood-kitchen/SuggestionCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, Bot } from 'lucide-react';

export function WhatsInYourKitchen() {
  const { diet } = useDiet();
  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestByIngredientsOutput['suggestions']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
        if (diet === 'veg') return recipe.diet === 'veg';
        if (diet === 'non-veg') return recipe.diet === 'non-veg';
        return true;
    }).map(({ slug, title, description, ingredients }) => ({ slug, title, description, ingredients }));
  }, [diet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) {
        setError("Please enter some ingredients you have.");
        return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await getSuggestionsByIngredients({
        ingredients: ingredients.split(',').map(i => i.trim()),
        recipes: activeRecipes,
      });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        setError("I couldn't find any matching recipes. Try using more common ingredients.");
      }
    } catch (e) {
      console.error(e);
      setError("An AI error occurred. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-accent">What&apos;s In Your Kitchen?</h2>
      <p className="max-w-2xl mx-auto mt-2 text-muted-foreground">
        Tell us what ingredients you have, and we&apos;ll suggest what you can make.
      </p>

      <Card className="max-w-lg mx-auto mt-8 p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <Input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., onion, rice, tomato, chicken"
            className="h-12 text-base flex-grow"
            disabled={loading}
          />
          <Button type="submit" size="lg" className="h-12 w-full sm:w-auto" disabled={loading}>
            {loading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
            Get Suggestions
          </Button>
        </form>
      </Card>
      
      <div className="mt-12">
        {loading && (
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-semibold">Savora is checking your pantry...</p>
          </div>
        )}

        {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto text-left">
                <Bot className="h-4 w-4" />
                <AlertTitle>Suggestion Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {suggestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
