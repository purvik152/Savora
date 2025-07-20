
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, WandSparkles, RefreshCw, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { inventRecipe, InventRecipeOutput } from '@/ai/flows/chef-challenge-flow';
import { generateRecipeImage } from '@/ai/flows/generate-recipe-image-flow';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

// A pool of interesting ingredients for the challenge
const ingredientPool = [
    'Chicken Breast', 'Salmon Fillet', 'Firm Tofu', 'Black Beans', 'Avocado',
    'Sweet Potato', 'Broccoli', 'Spinach', 'Quinoa', 'Feta Cheese',
    'Mango', 'Jalapeño', 'Coconut Milk', 'Ginger', 'Lime', 'Mushrooms',
    'Bell Pepper', 'Onion', 'Garlic', 'Tomato'
];

interface InventedRecipeWithImage extends InventRecipeOutput {
    imageDataUri?: string | null;
}


function RecipeDisplay({ recipe, image, imageLoading }: { recipe: InventRecipeOutput, image: string | null, imageLoading: boolean }) {
    return (
        <Card className="mt-8 animate-fade-in-up">
            <CardHeader>
                <div className="relative h-64 w-full rounded-lg overflow-hidden bg-secondary">
                    {imageLoading ? (
                        <Skeleton className="h-full w-full" />
                    ) : (
                        image && <Image src={image} alt={recipe.title} fill className="object-cover" sizes="100vw" />
                    )}
                </div>
                <CardTitle className="mt-4 text-3xl">{recipe.title}</CardTitle>
                <CardDescription>{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-8">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <span className="font-bold">Prep Time</span>
                        <span className="text-muted-foreground block">{recipe.prepTime}</span>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <span className="font-bold">Cook Time</span>
                        <span className="text-muted-foreground block">{recipe.cookTime}</span>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <span className="font-bold">Servings</span>
                        <span className="text-muted-foreground block">{recipe.servings}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">Ingredients</h3>
                        <ul className="space-y-3">
                            {recipe.inventedIngredients.map((ing, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                    <span>{ing}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-bold mb-4">Instructions</h3>
                        <ol className="space-y-4">
                            {recipe.inventedInstructions.map((step, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
                                    <p className="flex-1 text-base text-foreground/90">{step}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default function ChefChallengePage() {
    const [challengeIngredients, setChallengeIngredients] = useState<string[]>([]);
    const [inventedRecipe, setInventedRecipe] = useState<InventedRecipeWithImage | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);

    const generateIngredients = useCallback(() => {
        const shuffled = [...ingredientPool].sort(() => 0.5 - Math.random());
        setChallengeIngredients(shuffled.slice(0, 3));
        setInventedRecipe(null);
        setError(null);
    }, []);

    // Generate initial ingredients on component mount
    useState(() => {
        generateIngredients();
    });

    const handleInventRecipe = async () => {
        if (challengeIngredients.length === 0) return;
        setLoading(true);
        setError(null);
        setInventedRecipe(null);
        setImageLoading(true);

        try {
            const recipeResult = await inventRecipe({ ingredients: challengeIngredients });
            if (recipeResult) {
                setInventedRecipe(recipeResult); // Set recipe first

                // Now generate the image
                try {
                    const imageResult = await generateRecipeImage({ title: recipeResult.imageGenerationPrompt });
                    setInventedRecipe(prev => prev ? { ...prev, imageDataUri: imageResult.imageDataUri } : null);
                } catch (imgErr) {
                    console.error("Image generation failed:", imgErr);
                    // Still show the recipe, but with a placeholder image
                    setInventedRecipe(prev => prev ? { ...prev, imageDataUri: 'https://placehold.co/600x400.png' } : null);
                }
            } else {
                setError("The AI chef is stumped! Please try a new set of ingredients.");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An AI error occurred. Please try again.");
        } finally {
            setLoading(false);
            setImageLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
                <WandSparkles className="mx-auto h-16 w-16 text-primary mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Chef's Challenge</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Savora has chosen a few ingredients. Can our AI chef invent a delicious recipe on the spot?
                </p>
            </div>

            <Card className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                    <CardTitle className="text-center">Your Mystery Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center gap-4">
                    {challengeIngredients.map((ing, i) => (
                        <div key={i} className="bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-full animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                            {ing}
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleInventRecipe} disabled={loading} size="lg">
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <WandSparkles className="mr-2 h-5 w-5" />}
                        {loading ? "Inventing..." : "Invent a Recipe!"}
                    </Button>
                    <Button onClick={generateIngredients} variant="outline" size="lg" disabled={loading}>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        New Ingredients
                    </Button>
                </CardFooter>
            </Card>

            <div className="mt-8 max-w-4xl mx-auto">
                 {error && (
                    <Alert variant="destructive" className="animate-fade-in-up">
                        <AlertTitle>Invention Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {inventedRecipe && (
                    <RecipeDisplay recipe={inventedRecipe} image={inventedRecipe.imageDataUri || null} imageLoading={imageLoading} />
                )}
            </div>
        </div>
    );
}
