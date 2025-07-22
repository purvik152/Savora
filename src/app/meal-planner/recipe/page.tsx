
'use client';

import { notFound, useRouter } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, Mic, ShoppingCart, ExternalLink, Minus, Plus, Loader2, ClipboardList, HeartPulse, Check, ChefHat, Carrot, Apple, Leaf, Languages, Heart, AlertTriangle, WandSparkles, Bot, Video } from "lucide-react";
import { VoiceAssistant } from '@/components/recipes/VoiceAssistant';
import { InstructionStep } from '@/components/recipes/InstructionStep';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { parseIngredientsForSearch } from '@/ai/flows/parse-ingredients-flow';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { SingleRecipe } from '@/ai/flows/generate-recipe-by-goal-types';


function GeneratedRecipeView({ recipe }: { recipe: SingleRecipe }) {
  const voiceAssistantRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [isOrdering, setIsOrdering] = useState(false);

  // State for voice guidance highlighting
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
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
  } satisfies ChartConfig), []);

  const nutritionData = useMemo(() => {
    return [
      { name: 'protein', value: parseInt(recipe.nutrition.protein, 10) || 0, label: 'Protein' },
      { name: 'carbohydrates', value: parseInt(recipe.nutrition.carbs, 10) || 0, label: 'Carbs' },
      { name: 'fat', value: parseInt(recipe.nutrition.fat, 10) || 0, label: 'Fat' },
    ];
  }, [recipe]);


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
      const ingredientsToOrder = Array.from(checkedIngredients).map(index => recipe.ingredients[index]);
      
      const result = await parseIngredientsForSearch({ 
          ingredients: ingredientsToOrder,
          language: 'English',
      });
      
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
    <div>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="p-0 relative h-64 md:h-96">
            <Image
              src="https://placehold.co/600x400.png"
              alt={recipe.recipeName}
              fill
              className="object-cover"
              sizes="100vw"
              data-ai-hint="generated recipe meal"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <Badge variant="secondary" className="mb-2">AI Generated</Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{recipe.recipeName}</h1>
              <p className="mt-2 text-lg text-white/90 max-w-2xl drop-shadow-md">{recipe.description}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <h2 className="text-2xl font-bold mb-4">Ingredients</h2>
                        <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <span>{ingredient}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
                        <ol className="space-y-4">
                            {recipe.instructions.map((step, index) => (
                                <InstructionStep 
                                    key={index} 
                                    step={step} 
                                    index={index} 
                                    isHighlighted={index === highlightedStep}
                                />
                            ))}
                        </ol>
                    </div>
                </div>
                
                <div className="mt-12">
                  <Accordion type="multiple" className="w-full space-y-4">
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
                                {recipe.ingredients.map((ingredient, index) => (
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
                                        dataKey="label"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        width={80}
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
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
                            </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {hasMounted && (
                  <div ref={voiceAssistantRef} className="pt-8 mt-8 border-t">
                    <VoiceAssistant
                      recipeTitle={recipe.recipeName}
                      instructions={recipe.instructions}
                      language="english"
                      onStepChange={setHighlightedStep}
                    />
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function GeneratedRecipePage() {
  const [recipe, setRecipe] = useState<SingleRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This code runs only on the client
    const recipeJson = sessionStorage.getItem('generatedRecipe');
    if (recipeJson) {
      setRecipe(JSON.parse(recipeJson));
    } else {
      // If there's no recipe data, maybe redirect back to the planner
      router.push('/meal-planner');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <Skeleton className="h-screen w-full" />;
  }
  
  if (!recipe) {
    // This will be brief as the redirect will happen quickly
    return null;
  }

  return <GeneratedRecipeView recipe={recipe} />;
}
