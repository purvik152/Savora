
'use client';

import Image from "next/image";
import Link from "next/link";
import { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { recipes, Recipe } from "@/lib/recipes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useDiet } from "@/contexts/DietContext";
import { Skeleton } from "@/components/ui/skeleton";

const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Link href={`/recipes/${recipe.slug}`} className="block h-full">
        <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group">
        <div className="relative w-full h-48">
            <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out rounded-t-lg"
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

function RecipesContent() {
  const { diet } = useDiet();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const activeRecipes = useMemo(() => {
    if (diet === 'veg') {
      return recipes.filter(r => r.diet === 'veg');
    }
    // In non-veg mode, show all recipes
    return recipes;
  }, [diet]);
  
  const filteredRecipes = useMemo(() => {
    if (!query) {
      return [];
    }
    const lowerCaseQuery = query.toLowerCase();
    return activeRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(lowerCaseQuery) ||
          recipe.description.toLowerCase().includes(lowerCaseQuery) ||
          recipe.cuisine.toLowerCase().includes(lowerCaseQuery) ||
          recipe.category.toLowerCase().includes(lowerCaseQuery)
      );
  }, [query, activeRecipes]);

  const cuisineToFlagClass: { [key: string]: string } = {
    American: 'flag-american',
    Italian: 'flag-italian',
    French: 'flag-french',
    Mexican: 'flag-mexican',
    Indian: 'flag-indian',
    Greek: 'flag-greek',
    Thai: 'flag-thai',
    Spanish: 'flag-spanish',
    Asian: 'flag-asian',
    Mediterranean: 'flag-mediterranean',
    'Middle Eastern': 'flag-middle-eastern',
  };

  if (query) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Search Results</h1>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">
              {filteredRecipes.length > 0
                ? `Found ${filteredRecipes.length} recipe(s) for "${query}"`
                : `No recipes found for "${query}". Try a different search.`}
            </p>
        </div>
        {filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Original page content for when there's no search query
  const cuisines = [...new Set(activeRecipes.map((r) => r.cuisine))];
  const breakfastRecipes = activeRecipes.filter(r => r.category === 'Breakfast');
  const lunchRecipes = activeRecipes.filter(r => r.category === 'Lunch');
  const dinnerRecipes = activeRecipes.filter(r => r.category === 'Dinner');

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Our Recipes</h1>
        <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">From quick bites to family feasts, find your next favorite meal here.</p>
      </div>

      <section id="cuisines" className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Explore by Cuisine</h2>
        {cuisines.map((cuisine) => {
          const cuisineRecipes = activeRecipes
            .filter((r) => r.cuisine === cuisine)
            .slice(0, 3);
          if (cuisineRecipes.length === 0) return null;

          const flagClass = cuisineToFlagClass[cuisine] || 'flag-asian';

          return (
            <div key={cuisine} className="mb-12">
              <h3 className="cuisine-title mb-6">
                <span className={cn('cuisine-title-gradient', flagClass)}>
                  {cuisine}
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {cuisineRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Separator className="my-16" />

      <section id="meal-types">
         <h2 className="text-3xl font-bold mb-8 text-center">Or Browse by Meal Type</h2>
        <Tabs defaultValue="breakfast" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="breakfast" disabled={breakfastRecipes.length === 0}>
               Breakfast
            </TabsTrigger>
            <TabsTrigger value="lunch" disabled={lunchRecipes.length === 0}>
               Lunch
            </TabsTrigger>
            <TabsTrigger value="dinner" disabled={dinnerRecipes.length === 0}>
               Dinner
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="breakfast">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {breakfastRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </TabsContent>
          
          <TabsContent value="lunch">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {lunchRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </TabsContent>

          <TabsContent value="dinner">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dinnerRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </TabsContent>
        </Tabs>
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
