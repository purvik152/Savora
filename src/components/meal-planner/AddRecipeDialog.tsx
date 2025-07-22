
'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { recipes as allRecipes, type Recipe } from '@/lib/recipes';
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
    return allRecipes.filter(recipe => {
        if (diet === 'veg') return recipe.diet === 'veg';
        if (diet === 'non-veg') return recipe.diet === 'non-veg';
        return true;
    });
  }, [diet]);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery) return availableRecipes;
    const lowerQuery = searchQuery.toLowerCase();
    return availableRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.cuisine.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, availableRecipes]);

  const handleSelectRecipe = (recipe: Recipe) => {
    onAddRecipe(recipe);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Recipe to Your Plan</DialogTitle>
          <DialogDescription>
            Search for a recipe from the library to add to your meal slot.
          </DialogDescription>
        </DialogHeader>
        <div className="p-1">
          <Input 
            placeholder="Search for a recipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-72">
            <div className="space-y-2 pr-4">
              {filteredRecipes.map(recipe => (
                <div 
                  key={recipe.id} 
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
                  onClick={() => handleSelectRecipe(recipe)}
                >
                  <Image 
                    src={recipe.image}
                    alt={recipe.title}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover w-16 h-12"
                    data-ai-hint={recipe.imageHint}
                  />
                  <div className="flex-grow">
                    <h4 className="font-semibold">{recipe.title}</h4>
                    <p className="text-sm text-muted-foreground">{recipe.cuisine}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
