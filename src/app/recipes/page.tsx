
'use client';

import Image from "next/image";
import Link from "next/link";
import { useMemo, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { recipes as allRecipes, Recipe } from "@/lib/recipes";
import { cn } from "@/lib/utils";
import { useDiet } from "@/contexts/DietContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const RecipeCard = ({ recipe, animationDelay }: { recipe: Recipe, animationDelay?: string }) => (
    <Link href={`/recipes/${recipe.slug}`} className="block h-full animate-fade-in-up" style={{ animationDelay }}>
        <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group">
        <div className="relative w-full h-48">
            <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out rounded-lg"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            data-ai-hint={recipe.imageHint}
            />
        </div>
        <CardContent className="flex flex-grow flex-col p-6">
            <CardTitle className="text-xl font-semibold mb-2 line-clamp-2">{recipe.title}</CardTitle>
            <p className="text-muted-foreground line-clamp-3 flex-grow">{recipe.description}</p>
        </CardContent>
        </Card>
    </Link>
);

const countryToFlagClass: Record<string, string> = {
  'USA': 'flag-usa',
  'Italy': 'flag-italy',
  'France': 'flag-france',
  'Mexico': 'flag-mexico',
  'India': 'flag-india',
  'Greece': 'flag-greece',
  'Thailand': 'flag-thailand',
  'Spain': 'flag-spain',
  'China': 'flag-china',
  'UK': 'flag-uk',
  'Turkey': 'flag-turkey',
  'Japan': 'flag-japan',
  'Lebanon': 'flag-lebanon',
  'Egypt': 'flag-egypt',
  'Vietnam': 'flag-vietnam',
};


function RecipesContent() {
  const { diet } = useDiet();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const countryParam = searchParams.get('country');
  const [selectedCountry, setSelectedCountry] = useState<string>(countryParam || '');

  const activeRecipes = useMemo(() => {
    if (diet === 'veg') {
      return allRecipes.filter(r => r.diet === 'veg');
    }
    // In non-veg mode, show only non-veg recipes
    return allRecipes.filter(r => r.diet === 'non-veg');
  }, [diet]);

  useEffect(() => {
    // If there are no recipes for the selected country in the current diet, reset the selection
    const countriesForDiet = [...new Set(activeRecipes.map(r => r.country))];
    if (selectedCountry && !countriesForDiet.includes(selectedCountry)) {
        setSelectedCountry('');
    }
  }, [diet, selectedCountry, activeRecipes]);
  
  const filteredRecipes = useMemo(() => {
    let recipesToFilter = activeRecipes;
    
    if (query) {
        const lowerCaseQuery = query.toLowerCase();
        return recipesToFilter.filter(
            (recipe) =>
              recipe.title.toLowerCase().includes(lowerCaseQuery) ||
              recipe.description.toLowerCase().includes(lowerCaseQuery) ||
              recipe.cuisine.toLowerCase().includes(lowerCaseQuery) ||
              recipe.category.toLowerCase().includes(lowerCaseQuery)
          );
    }
    
    if (selectedCountry) {
        return recipesToFilter.filter(r => r.country === selectedCountry);
    }

    return [];
  }, [query, activeRecipes, selectedCountry]);

  const countries = useMemo(() => [...new Set(activeRecipes.map(r => r.country))].sort(), [activeRecipes]);

  const recipesByCuisine = useMemo(() => {
    if (!selectedCountry) return {};
    return filteredRecipes.reduce((acc, recipe) => {
        (acc[recipe.cuisine] = acc[recipe.cuisine] || []).push(recipe);
        return acc;
    }, {} as Record<string, Recipe[]>);
  }, [selectedCountry, filteredRecipes]);

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
              <RecipeCard key={recipe.id} recipe={recipe} animationDelay={`${index * 100}ms`} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Original page content for when there's no search query
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Our Recipes</h1>
        <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">From quick bites to family feasts, find your next favorite meal here.</p>
      </div>
      
      <div className="max-w-md mx-auto mb-12 animate-fade-in-up" style={{animationDelay: '100ms'}}>
        <Select onValueChange={setSelectedCountry} value={selectedCountry}>
            <SelectTrigger className="h-12 text-lg">
                <Globe className="mr-3 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Select a Country to Explore..." />
            </SelectTrigger>
            <SelectContent>
                {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      <div className="flex items-center gap-3">
                        <div className={cn("h-4 w-6 rounded-sm", countryToFlagClass[country] || 'bg-muted')}></div>
                        <span>{country}</span>
                      </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <section id="recipes-by-country">
        {selectedCountry ? (
            Object.entries(recipesByCuisine).map(([cuisine, recipes], cuisineIndex) => (
                <div key={cuisine} className="mb-12 animate-fade-in-up" style={{animationDelay: `${(cuisineIndex + 2) * 100}ms`}}>
                    <h2 className="text-3xl font-bold mb-6">{cuisine}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recipes.map((recipe, recipeIndex) => (
                            <RecipeCard key={recipe.id} recipe={recipe} animationDelay={`${recipeIndex * 100}ms`}/>
                        ))}
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center text-muted-foreground py-16 animate-fade-in-up">
                <p>Please select a country to see the delicious recipes it has to offer.</p>
            </div>
        )}
      </section>

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
