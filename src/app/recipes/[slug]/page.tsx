
'use client';

import { notFound } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, Mic, ShoppingCart, ExternalLink, Minus, Plus, Loader2, ClipboardList, HeartPulse, Check, ChefHat, Carrot, Apple, Leaf } from "lucide-react";
import { getRecipeBySlug } from '@/lib/recipes';
import { VoiceAssistant } from '@/components/recipes/VoiceAssistant';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { adjustRecipe } from '@/ai/flows/adjust-recipe-flow';
import { parseIngredientsForSearch } from '@/ai/flows/parse-ingredients-flow';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";


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
  
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setCheckedIngredients(new Set());
  }, [displayedIngredients]);

  if (!recipe) {
    notFound();
  }

  const chartConfig = useMemo(() => ({
    protein: {
      label: 'Protein (g)',
      color: 'hsl(var(--chart-1))',
    },
    carbohydrates: {
      label: 'Carbs (g)',
      color: 'hsl(var(--chart-2))',
    },
    fat: {
      label: 'Fat (g)',
      color: 'hsl(var(--chart-3))',
    },
    fiber: {
        label: 'Fiber (g)',
        color: 'hsl(var(--chart-4))',
    },
    sugar: {
        label: 'Sugar (g)',
        color: 'hsl(var(--chart-5))',
    },
  } satisfies ChartConfig), []);

  const nutritionData = useMemo(() => {
    if (!recipe) return [];
    // The name properties must be lowercase to match the keys in chartConfig
    return [
      { name: 'protein', value: parseInt(recipe.nutrition.protein, 10) || 0 },
      { name: 'carbohydrates', value: parseInt(recipe.nutrition.carbohydrates, 10) || 0 },
      { name: 'fat', value: parseInt(recipe.nutrition.fat, 10) || 0 },
      { name: 'fiber', value: parseInt(recipe.nutrition.fiber, 10) || 0 },
      { name: 'sugar', value: parseInt(recipe.nutrition.sugar, 10) || 0 },
    ];
  }, [recipe]);

  const handleServingsChange = useCallback(async (newServings: number) => {
    if (newServings < 1 || isAdjusting) return;

    setServings(newServings);

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
              sizes="100vw"
              data-ai-hint={recipe.imageHint}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{recipe.title}</h1>
              <p className="mt-2 text-lg text-white/90 max-w-2xl drop-shadow-md">{recipe.description}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto relative">
                {/* Background Doodles for the Card */}
                <div className="absolute top-20 -left-24 text-primary/10 -z-10 transform -rotate-12 hidden md:block">
                    <ChefHat className="h-48 w-48" />
                </div>
                <div className="absolute top-1/3 -right-24 text-primary/10 -z-10 transform rotate-12 hidden md:block">
                    <Carrot className="h-40 w-40" />
                </div>
                <div className="absolute bottom-1/4 -left-20 text-primary/10 -z-10 transform rotate-6 hidden md:block">
                    <Apple className="h-32 w-32" />
                </div>
                <div className="absolute bottom-0 -right-20 text-primary/10 -z-10 transform -rotate-6 hidden md:block">
                    <Leaf className="h-36 w-36" />
                </div>
              <div className="relative">
                {isAdjusting && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 font-semibold">Adjusting recipe...</span>
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
                  <div className="relative group flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-secondary">
                    <Clock className="absolute -top-2 -left-2 h-16 w-16 text-primary/10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Clock className="h-8 w-8 text-primary mb-2" />
                      <span className="font-bold">Prep Time</span>
                      <span className="text-muted-foreground">{recipe.prepTime}</span>
                    </div>
                  </div>

                  <div className="relative group flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-secondary">
                    <Flame className="absolute -top-2 -right-2 h-16 w-16 text-primary/10 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Flame className="h-8 w-8 text-primary mb-2" />
                      <span className="font-bold">Cook Time</span>
                      <span className="text-muted-foreground">{recipe.cookTime}</span>
                    </div>
                  </div>

                  <div className="relative group flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-secondary">
                    <Users className="absolute -bottom-2 -left-2 h-16 w-16 text-primary/10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
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
                  </div>

                  <div className="relative group flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-secondary cursor-pointer" onClick={handleScrollToVoiceAssistant}>
                    <Mic className="absolute -bottom-2 -right-2 h-16 w-16 text-primary/10 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Mic className="h-8 w-8 text-primary mb-2" />
                      <span className="font-bold">Voice Guide</span>
                      <span className="text-sm text-primary">Start Cooking</span>
                    </div>
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
                
                <div className="mt-12">
                  <Accordion type="multiple" className="w-full space-y-4">
                    <AccordionItem value="ingredients" className="border-none rounded-lg bg-secondary/30 overflow-hidden">
                      <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <ClipboardList className="h-6 w-6 text-primary" />
                          Ingredients
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 bg-background/50">
                        <ul className="space-y-3 pt-4 pb-4 border-t">
                          {displayedIngredients.map((ingredient, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                              <span>{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
              
                    <AccordionItem value="grocery-list" className="border-none rounded-lg bg-secondary/30 overflow-hidden">
                      <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="h-6 w-6 text-primary" />
                          Grocery List
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 bg-background/50">
                        <div className="pt-4 pb-4 border-t">
                            <div className="space-y-4">
                                {displayedIngredients.map((ingredient, index) => (
                                <div key={index} className="flex items-center space-x-3">
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
                        </div>
                      </AccordionContent>
                    </AccordionItem>
              
                    <AccordionItem value="nutrition" className="border-none rounded-lg bg-secondary/30 overflow-hidden">
                      <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <HeartPulse className="h-6 w-6 text-primary" />
                          Nutrition Facts
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 bg-background/50">
                          <div className="pt-4 pb-4 border-t space-y-4">
                                <div className="text-center">
                                <p className="text-muted-foreground">Calories</p>
                                <p className="text-3xl font-bold text-foreground">{recipe.nutrition.calories}</p>
                                </div>
                                <ChartContainer config={chartConfig} className="w-full h-[250px]">
                                <BarChart accessibilityLayer data={nutritionData} layout="vertical" margin={{ left: 10, right: 20 }}>
                                    <CartesianGrid horizontal={false} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        width={100}
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                                        tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                                    />
                                    <XAxis type="number" hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Bar dataKey="value" layout="vertical" radius={5}>
                                        {nutritionData.map((entry) => (
                                            <Cell key={entry.name} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                                </ChartContainer>
                                <div className="flex justify-between items-center text-sm px-4 pt-4 border-t">
                                    <span className="font-medium text-muted-foreground">Sodium</span>
                                    <span className="font-bold text-foreground">{recipe.nutrition.sodium}</span>
                                </div>
                            </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>


                {hasMounted && (
                  <div ref={voiceAssistantRef} className="pt-8 mt-8 border-t">
                    <VoiceAssistant recipeTitle={recipe.title} instructions={displayedInstructions} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
