
'use client';

import Image from "next/image";
import Link from "next/link";
import { useMemo, Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recipes as allRecipes, Recipe } from "@/lib/recipes";
import { cn } from "@/lib/utils";
import { useDiet } from "@/contexts/DietContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { Flag } from "@/components/icons/Flag";
import { useUser } from "@/contexts/UserContext";
import { LoginSuggestionDialog } from "@/components/common/LoginSuggestionDialog";

const RecipeCard = ({ recipe, onCardClick, animationDelay }: { recipe: Recipe, onCardClick: (recipe: Recipe) => void, animationDelay?: string }) => (
    <div onClick={() => onCardClick(recipe)} className="block h-full animate-fade-in-up cursor-pointer" style={{ animationDelay }}>
        <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group">
            <CardHeader className="p-0 border-b">
                <div className="relative w-full h-48">
                    <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    data-ai-hint={recipe.imageHint}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col p-4">
                <CardTitle className="text-xl font-semibold mb-2 line-clamp-2">{recipe.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{recipe.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-2 border-t">
                    <span>{recipe.cuisine}</span>
                    <span>{recipe.cookTime}</span>
                </div>
            </CardContent>
        </Card>
    </div>
);


function RecipesContent() {
  const { diet } = useDiet();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const query = searchParams.get('q');
  const countryParam = searchParams.get('country');
  const [selectedCountry, setSelectedCountry] = useState<string>(countryParam || '');
  const [mounted, setMounted] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeRecipes = useMemo(() => {
    if (!mounted) {
      return allRecipes.filter(r => r.diet === 'non-veg');
    }
    if (diet === 'veg') {
      return allRecipes.filter(r => r.diet === 'veg');
    }
    return allRecipes;
  }, [diet, mounted]);

  useEffect(() => {
    if (mounted) {
      const countriesForDiet = [...new Set(activeRecipes.map(r => r.country))];
      if (selectedCountry && !countriesForDiet.includes(selectedCountry)) {
          setSelectedCountry('');
      }
    }
  }, [diet, selectedCountry, activeRecipes, mounted]);
  
  const filteredRecipes = useMemo(() => {
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      return activeRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(lowerCaseQuery) ||
          recipe.description.toLowerCase().includes(lowerCaseQuery) ||
          recipe.cuisine.toLowerCase().includes(lowerCaseQuery) ||
          recipe.category.toLowerCase().includes(lowerCaseQuery)
      );
    }
    if (selectedCountry) {
      return activeRecipes.filter(r => r.country === selectedCountry);
    }
    return activeRecipes;
  }, [query, activeRecipes, selectedCountry]);

  const countries = useMemo(() => [...new Set(activeRecipes.map(r => r.country))].sort(), [activeRecipes]);

  const recipesByCuisine = useMemo(() => {
    return filteredRecipes.reduce((acc, recipe) => {
        (acc[recipe.cuisine] = acc[recipe.cuisine] || []).push(recipe);
        return acc;
    }, {} as Record<string, Recipe[]>);
  }, [filteredRecipes]);

  const handleRecipeClick = (recipe: Recipe) => {
    if (user) {
        router.push(`/recipes/${recipe.slug}`);
    } else {
        setSelectedRecipe(recipe);
        setShowLoginDialog(true);
    }
  };

  const handleContinue = () => {
    if (selectedRecipe) {
        router.push(`/recipes/${selectedRecipe.slug}`);
    }
    setShowLoginDialog(false);
  };

  if (!mounted) {
    return <RecipesPageLoadingSkeleton />;
  }

  if (query) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Search Results</h1>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
              {filteredRecipes.length > 0
                ? `Found ${filteredRecipes.length} recipe(s) for "${query}"`
                : `No recipes found for "${query}". Try a different search.`}
            </p>
        </div>
        {filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} onCardClick={handleRecipeClick} animationDelay={`${index * 100}ms`} />
            ))}
          </div>
        )}
         <LoginSuggestionDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} onContinue={handleContinue} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Our Recipes</h1>
        <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">From quick bites to family feasts, find your next favorite meal here. Browse by cuisine or filter by country.</p>
      </div>
      
      <div className="max-w-md mx-auto mb-12 animate-fade-in-up" style={{animationDelay: '100ms'}}>
        <Select onValueChange={setSelectedCountry} value={selectedCountry}>
            <SelectTrigger className="h-12 text-lg">
                <Globe className="mr-3 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Explore by Country..." />
            </SelectTrigger>
            <SelectContent>
                {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      <div className="flex items-center gap-3">
                        <Flag country={country} />
                        <span>{country}</span>
                      </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <section id="recipes-by-cuisine">
        {Object.entries(recipesByCuisine).map(([cuisine, recipes], cuisineIndex) => (
            <div key={cuisine} className="mb-12 animate-fade-in-up" style={{animationDelay: `${(cuisineIndex + 2) * 100}ms`}}>
                <div className="flex items-center gap-4 mb-6">
                    {selectedCountry && <Flag country={selectedCountry} className="h-6 w-8 rounded-md shadow-md" />}
                    <h2 className="text-3xl font-bold">{cuisine}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recipes.map((recipe, recipeIndex) => (
                        <RecipeCard key={recipe.id} recipe={recipe} onCardClick={handleRecipeClick} animationDelay={`${recipeIndex * 100}ms`}/>
                    ))}
                </div>
            </div>
        ))}
        {Object.keys(recipesByCuisine).length === 0 && (
             <div className="text-center text-muted-foreground py-16 animate-fade-in-up">
                <p>Please select a country to see the delicious recipes it has to offer.</p>
            </div>
        )}
      </section>
      <LoginSuggestionDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} onContinue={handleContinue} />
    </div>
  );
}


function RecipesPageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
       <div className="text-center mb-12">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
      </div>
      <div className="mb-12">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    </div>
  )
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<RecipesPageLoadingSkeleton />}>
      <RecipesContent />
    </Suspense>
  )
}
