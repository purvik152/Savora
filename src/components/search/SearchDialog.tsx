
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Recipe, recipes } from '@/lib/recipes';
import { Search, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const popularRecipes = recipes.slice(0, 4); // Show first 4 as popular

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length > 1) {
      setLoading(true);
      const queryLower = searchQuery.toLowerCase();
      const filteredResults = recipes.filter(
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
  }, [popularRecipes]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Reset results when dialog opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults(popularRecipes);
    }
  }, [open, popularRecipes]);

  const handleResultClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-full max-w-2xl h-auto max-h-[75vh] top-1/2 -translate-y-1/2 sm:top-16 sm:-translate-y-0 rounded-lg overflow-hidden">
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for recipes, ingredients, or cuisines..."
            className="h-12 w-full border-0 shadow-none focus-visible:ring-0 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoFocus
          />
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
                {query.trim().length > 1 ? 'Search Results' : 'Popular Recipes'}
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
                        className="rounded-md object-cover w-16 h-16"
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
