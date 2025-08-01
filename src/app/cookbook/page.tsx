
'use client';

import Image from "next/image";
import Link from "next/link";
import { recipes, Recipe } from "@/lib/recipes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { useDiet } from "@/contexts/DietContext";
import { useMemo } from "react";

// Get the last 25 recipes, which are our new global additions
const allCookbookRecipes = recipes.slice(-25);

const CookbookRecipeCard = ({ recipe, animationDelay }: { recipe: Recipe, animationDelay: string }) => (
    <Link href={`/recipes/${recipe.slug}`} className="block h-full animate-fade-in-up" style={{ animationDelay }}>
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
                    <span>{recipe.difficulty}</span>
                </div>
            </CardContent>
        </Card>
    </Link>
);

export default function CookbookPage() {
    const { diet } = useDiet();

    const cookbookRecipes = useMemo(() => {
        if (diet === 'veg') {
            return allCookbookRecipes.filter(r => r.diet === 'veg');
        }
        return allCookbookRecipes.filter(r => r.diet === 'non-veg');
    }, [diet]);

    return (
        <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
                <ChefHat className="mx-auto h-16 w-16 text-primary mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Savora Cookbook</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    A curated collection of our top 25 global recipes, hand-picked for you to explore and enjoy. From beginner-friendly dishes to advanced culinary creations.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {cookbookRecipes.map((recipe, index) => (
                    <CookbookRecipeCard key={recipe.id} recipe={recipe} animationDelay={`${index * 50}ms`} />
                ))}
            </div>

            {cookbookRecipes.length === 0 && (
                <div className="text-center col-span-full py-16 animate-fade-in-up">
                    <p className="text-muted-foreground">
                        No cookbook recipes found for the '{diet}' view yet.
                    </p>
                </div>
            )}
        </div>
    );
}
