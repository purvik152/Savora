'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CommunityRecipe, getCommunityRecipes } from '@/lib/community-recipes';
import { CommunityRecipeCard } from '@/components/community/CommunityRecipeCard';
import { Users, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDiet } from '@/contexts/DietContext';

export default function CommunityPage() {
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { diet } = useDiet();

  useEffect(() => {
    setRecipes(getCommunityRecipes());
    setLoading(false);
  }, []);

  const handleUpvote = (recipeId: number) => {
    // In a real app, this would be an optimistic update followed by a server call.
    // For this prototype, we'll just update the local state.
    const updatedRecipes = recipes.map(r => 
      r.id === recipeId ? { ...r, upvotes: r.upvotes + 1 } : r
    );
    setRecipes(updatedRecipes);
  };
  
  const filteredRecipes = useMemo(() => {
    const sorted = [...recipes].sort((a, b) => b.upvotes - a.upvotes);
    if (diet === 'veg') {
      return sorted.filter(r => r.diet === 'veg');
    }
    return sorted.filter(r => r.diet === 'non-veg');
  }, [diet, recipes]);

  if (loading) {
      return (
        <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 py-8 md:py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading community recipes...</p>
        </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Users className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Community Kitchen</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Discover recipes created and shared by home cooks just like you. Upvote your favorites and submit your own creations to earn badges!
        </p>
        <Button asChild size="lg" className="mt-8">
            <Link href="/submit-recipe">
                <Upload className="mr-2 h-5 w-5" />
                Submit Your Recipe
            </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRecipes.map((recipe) => (
          <CommunityRecipeCard key={recipe.id} recipe={recipe} onUpvote={handleUpvote} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center col-span-full py-16">
          <p className="text-muted-foreground">
            No community recipes found for the '{diet}' view yet.
          </p>
        </div>
      )}
    </div>
  );
}
