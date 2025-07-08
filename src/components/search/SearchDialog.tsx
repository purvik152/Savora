
'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Recipe, recipes } from '@/lib/recipes';
import { Search, Loader2, Mic } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useDiet } from '@/contexts/DietContext';


interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { diet } = useDiet();

  // State for voice search
  const [isListening, setIsListening] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const activeRecipes = useMemo(() => {
    if (diet === 'veg') {
      return recipes.filter(r => r.diet === 'veg');
    }
    // In non-veg mode, show only non-veg recipes
    return recipes.filter(r => r.diet === 'non-veg');
  }, [diet]);

  const popularRecipes = useMemo(() => activeRecipes.slice(0, 4), [activeRecipes]);

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length > 1) {
      setLoading(true);
      const queryLower = searchQuery.toLowerCase();
      const filteredResults = activeRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(queryLower) ||
          recipe.description.toLowerCase().includes(queryLower) ||
          recipe.cuisine.toLowerCase().includes(queryLower) ||
          recipe.category.toLowerCase().includes(queryLower)
      );
      // Simulate loading
      setTimeout(() => {
        setResults(filteredResults);
        setLoading(false);
      }, 200)
    } else {
      setResults(popularRecipes);
    }
  }, [popularRecipes, activeRecipes]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Voice search is not supported in this browser. Please try Google Chrome.',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({
          variant: 'destructive',
          title: 'Voice Search Error',
          description: "Sorry, I couldn't hear you. Please try again.",
        });
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
    }
  }, [toast]);


  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Reset results when dialog opens or diet changes
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults(popularRecipes);
    }
  }, [open, popularRecipes]);

  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleResultClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-full max-w-2xl h-auto max-h-[75vh] top-1/2 -translate-y-1/2 sm:top-16 sm:-translate-y-0 rounded-lg overflow-hidden">
        <div className="flex items-center border-b pl-4 pr-2 sm:pr-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for recipes, ingredients, or cuisines..."
            className="h-12 w-full border-0 shadow-none focus-visible:ring-0 text-base flex-grow pr-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          {isBrowserSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceSearch}
              className={cn(
                "h-10 w-10 absolute right-12",
                isListening && 'text-destructive animate-pulse'
                )}
            >
              <Mic className="h-5 w-5" />
              <span className="sr-only">Search with voice</span>
            </Button>
          )}
        </div>
        <div className="overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">
                {query.trim().length > 1 ? 'Search Results' : `Popular ${diet === 'veg' ? 'Veg ' : ''}Recipes`}
              </h3>
              <ul className="space-y-2">
                {results.map((recipe) => (
                  <li key={recipe.id}>
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="flex items-center gap-4 p-2 rounded-md hover:bg-accent"
                      onClick={handleResultClick}
                    >
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover w-16 h-16"
                        data-ai-hint={recipe.imageHint}
                      />
                      <div className="flex-grow">
                        <p className="font-semibold">{recipe.title}</p>
                        <p className="text-sm text-muted-foreground">{recipe.cuisine} - {recipe.category}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && results.length === 0 && query.trim().length > 1 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No results found for "{query}"</p>
              <p className="text-sm">Try searching for something else.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
