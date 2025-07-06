'use client';

import { notFound } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, CheckCircle, Mic, ShoppingCart, ExternalLink, Minus, Plus, Loader2 } from "lucide-react";
import { getRecipeBySlug } from '@/lib/recipes';
import { VoiceAssistant } from '@/components/recipes/VoiceAssistant';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { adjustRecipe } from '@/ai/flows/adjust-recipe-flow';
import { parseIngredientsForSearch } from '@/ai/flows/parse-ingredients-flow';

export default function RecipePage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const recipe = getRecipeBySlug(slug);
  const voiceAssistantRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [hasMounted, setHasMounted] = useState(false);
  
  const initialServings = recipe ? parseInt(recipe.servings.match(/\d+/)?.[0] || '1', 10) : 1;
  const [servings, setServings] = useState(initialServings);
  const [displayedIngredients, setDisplayedIngredients] = useState(recipe?.ingredients || []);
  const [displayedInstructions, setDisplayedInstructions] = useState(recipe?.instructions || []);
  const [isAdjusting, setIsAdjusting] = useState(false);
  
  // New state for grocery list
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // When recipe scales, clear checkboxes.
  useEffect(() => {
    setCheckedIngredients(new Set());
  }, [displayedIngredients]);

  if (!recipe) {
    notFound();
  }

  const handleServingsChange = useCallback(async (newServings: number) => {
    if (newServings < 1 || isAdjusting) return;

    setServings(newServings);

    // If returning to original serving size, just reset from static data
    if (newServings === initialServings) {
      setDisplayedIngredients(recipe.ingredients);
      setDisplayedInstructions(recipe.instructions);
      return;
    }

    setIsAdjusting(true);

    try {
      const result = await adjustRecipe({
        originalIngredients: recipe.ingredients,
        originalInstructions: recipe.instructions,
        originalServings: initialServings,
        newServings: newServings,
      });
      if (result.adjustedIngredients && result.adjustedInstructions) {
        setDisplayedIngredients(result.adjustedIngredients);
        setDisplayedInstructions(result.adjustedInstructions);
      } else {
        throw new Error("AI did not return an adjusted recipe.");
      }
    } catch (error) {
      console.error("Failed to adjust recipe:", error);
      toast({
        variant: "destructive",
        title: "Adjustment Failed",
        description: "Could not adjust the recipe. Please try again.",
      });
      // Revert serving count if AI fails
      setServings(servings);
    } finally {
      setIsAdjusting(false);
    }
  }, [initialServings, isAdjusting, recipe.ingredients, recipe.instructions, servings, toast]);


  const handleScrollToVoiceAssistant = () => {
    voiceAssistantRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleCheckboxChange = (index: number, checked: boolean | 'indeterminate') => {
    const newChecked = new Set(checkedIngredients);
    if(checked) {
      newChecked.add(index);
    } else {
      newChecked.delete(index);
    }
    setCheckedIngredients(newChecked);
  };

  const handleOrderOnInstamart = async () => {
    if (checkedIngredients.size === 0) {
      toast({
        variant: "destructive",
        title: "No Items Selected",
        description: "Please check the ingredients you want to order.",
      });
      return;
    }
    
    setIsOrdering(true);
    
    try {
      const ingredientsToOrder = Array.from(checkedIngredients).map(index => displayedIngredients[index]);
      
      const result = await parseIngredientsForSearch({ ingredients: ingredientsToOrder });
      
      if (!result.searchTerms || result.searchTerms.length === 0) {
        throw new Error("AI could not parse ingredients for search.");
      }

      const ingredientsQuery = result.searchTerms.join(', ');
      const instamartUrl = `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(ingredientsQuery)}`;
      window.open(instamartUrl, '_blank');
    } catch (error) {
      console.error("Failed to parse ingredients for ordering:", error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Could not process ingredients for Instamart. Please try again.",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="p-0 relative h-64 md:h-96">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              data-ai-hint={recipe.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{recipe.title}</h1>
              <p className="mt-2 text-lg text-white/90 max-w-2xl drop-shadow-md">{recipe.description}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 relative">
                {isAdjusting && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 font-semibold">Adjusting recipe...</span>
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
                  <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <span className="font-bold">Prep Time</span>
                    <span className="text-muted-foreground">{recipe.prepTime}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                    <Flame className="h-8 w-8 text-primary mb-2" />
                    <span className="font-bold">Cook Time</span>
                    <span className="text-muted-foreground">{recipe.cookTime}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <span className="font-bold">Servings</span>
                     <div className="flex items-center gap-2 mt-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleServingsChange(servings - 1)} disabled={servings <= 1 || isAdjusting}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-foreground font-bold text-lg w-8 text-center">{servings}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleServingsChange(servings + 1)} disabled={isAdjusting}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary" onClick={handleScrollToVoiceAssistant}>
                    <Mic className="h-8 w-8 text-primary mb-2" />
                    <span className="font-bold">Voice Guide</span>
                    <span className="text-sm text-primary">Start Cooking</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Instructions</h2>
                  </div>
                  <ol className="space-y-6">
                    {displayedInstructions.map((step, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
                        <p className="flex-1 text-base text-foreground/90">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {hasMounted && (
                  <div ref={voiceAssistantRef} className="pt-8 mt-8 border-t">
                    <VoiceAssistant recipeTitle={recipe.title} instructions={displayedInstructions} />
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="sticky top-24">
                  {isAdjusting && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                  )}
                  <Card className="bg-secondary/30">
                    <CardHeader>
                      <h3 className="text-xl font-bold">Ingredients</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {displayedIngredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6 bg-secondary/30">
                    <CardHeader>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary"/> Grocery List
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {displayedIngredients.map((ingredient, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`ingredient-${index}`} 
                                    onCheckedChange={(checked) => handleCheckboxChange(index, checked)}
                                    checked={checkedIngredients.has(index)}
                                />
                                <label
                                    htmlFor={`ingredient-${index}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {ingredient}
                                </label>
                            </div>
                            ))}
                        </div>
                        <Button onClick={handleOrderOnInstamart} className="w-full mt-6" disabled={isOrdering}>
                           {isOrdering ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Order Selected with Instamart
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </CardContent>
                  </Card>
                                    
                  <Card className="mt-6 bg-secondary/30">
                    <CardHeader>
                        <h3 className="text-xl font-bold">Nutrition Facts</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <p><strong>Calories:</strong> {recipe.nutrition.calories}</p>
                           <p><strong>Protein:</strong> {recipe.nutrition.protein}</p>
                           <p><strong>Carbs:</strong> {recipe.nutrition.carbohydrates}</p>
                           <p><strong>Fat:</strong> {recipe.nutrition.fat}</p>
                        </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
