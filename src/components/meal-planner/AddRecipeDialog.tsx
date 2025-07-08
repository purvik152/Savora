'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { recipes as allRecipes, Recipe } from '@/lib/recipes';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useDiet } from '@/contexts/DietContext';

interface AddRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRecipe: (recipe: Recipe) => void;
}

export function AddRecipeDialog({ open, onOpenChange, onAddRecipe }: AddRecipeDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { diet } = useDiet();

  const availableRecipes = useMemo(() => {
    if (diet === 'veg') {
      return allRecipes.filter(recipe => recipe.diet === 'veg');
    }
    // In non-veg mode, show only non-veg recipes
    return allRecipes.filter(recipe => recipe.diet === 'non-veg');
  }, [diet]);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery) {
      return availableRecipes;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return availableRecipes.filter(
      recipe =>
        recipe.title.toLowerCase().includes(lowerCaseQuery) ||
        recipe.cuisine.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchQuery, availableRecipes]);
  
  // Reset search when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
    }
  }, [open]);

  const handleRecipeSelect = (recipe: Recipe) => {
    onAddRecipe(recipe);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 w-full max-w-2xl h-auto max-h-[75vh] top-1/2 -translate-y-1/2 sm:top-16 sm:-translate-y-0 rounded-lg overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Add a Recipe to Your Plan</DialogTitle>
          <DialogDescription>Select a recipe from the list below to add it to your meal slot.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for recipes..."
            className="h-12 w-full border-0 shadow-none focus-visible:ring-0 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-grow">
          <div className="p-4">
            {filteredRecipes.length > 0 ? (
              <ul className="space-y-2">
                {filteredRecipes.map((recipe) => (
                  <li key={recipe.id}>
                    <button
                      onClick={() => handleRecipeSelect(recipe)}
                      className="w-full text-left flex items-center gap-4 p-2 rounded-md hover:bg-accent transition-colors"
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
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recipes found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
