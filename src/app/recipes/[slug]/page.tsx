
'use client';

import { notFound, useParams } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, Mic, ShoppingCart, ExternalLink, Minus, Plus, Loader2, ClipboardList, HeartPulse, Check, ChefHat, Carrot, Apple, Leaf, Languages, Heart, AlertTriangle, WandSparkles, Bot } from "lucide-react";
import { getRecipeBySlug, Recipe } from '@/lib/recipes';
import { VoiceAssistant } from '@/components/recipes/VoiceAssistant';
import { InstructionStep } from '@/components/recipes/InstructionStep';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { adjustRecipe } from '@/ai/flows/adjust-recipe-flow';
import { parseIngredientsForSearch } from '@/ai/flows/parse-ingredients-flow';
import { adaptRecipe, AdaptRecipeOutput } from '@/ai/flows/adapt-recipe-flow';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipProvider,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { translateRecipe } from '@/ai/flows/translate-recipe-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { isFavoriteRecipe, addFavoriteRecipe, removeFavoriteRecipe, addPastRecipe } from '@/lib/user-data';
import { useAuth } from '@/contexts/AuthContext';


function RecipePageSkeleton() {
  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="p-0 relative h-64 md:h-96">
            <Skeleton className="h-full w-full" />
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
              <div className="mb-8">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="space-y-6">
                  <Skeleton className="h-6 w-full rounded-md" />
                  <Skeleton className="h-6 w-11/12 rounded-md" />
                  <Skeleton className="h-6 w-full rounded-md" />
                  <Skeleton className="h-6 w-10/12 rounded-md" />
                </div>
              </div>
               <div className="mt-12">
                   <div className="space-y-4">
                     <Skeleton className="h-16 w-full rounded-lg" />
                     <Skeleton className="h-16 w-full rounded-lg" />
                     <Skeleton className="h-16 w-full rounded-lg" />
                   </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function RecipeView({ recipe: initialRecipe }: { recipe: Recipe }) {
  const voiceAssistantRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  // State for the current recipe being displayed
  const [recipe, setRecipe] = useState(initialRecipe);
  const [isAdapted, setIsAdapted] = useState(false);

  const initialServings = parseInt(recipe.servings.match(/\d+/)?.[0] || '1', 10);
  const [servings, setServings] = useState(initialServings);
  const [displayedIngredients, setDisplayedIngredients] = useState(recipe.ingredients);
  const [displayedInstructions, setDisplayedInstructions] = useState(recipe.instructions);
  const [displayedPrepTime, setDisplayedPrepTime] = useState(recipe.prepTime);
  const [displayedCookTime, setDisplayedCookTime] = useState(recipe.cookTime);
  const [displayedTitle, setDisplayedTitle] = useState(recipe.title);
  
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [language, setLanguage] = useState('english');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [isOrdering, setIsOrdering] = useState(false);

  // State for recipe adaptation
  const [adaptRequest, setAdaptRequest] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationSummary, setAdaptationSummary] = useState<string | null>(null);

  const isProcessing = isAdjusting || isTranslating || isAdapting;
  
  const allergens = useMemo(() => recipe.allergens || [], [recipe.allergens]);
  
  // Effect to reset state when the underlying recipe changes (e.g., from adaptation)
  useEffect(() => {
    setDisplayedIngredients(recipe.ingredients);
    setDisplayedInstructions(recipe.instructions);
    setDisplayedPrepTime(recipe.prepTime);
    setDisplayedCookTime(recipe.cookTime);
    setDisplayedTitle(recipe.title);
    const newInitialServings = parseInt(recipe.servings.match(/\d+/)?.[0] || '1', 10);
    setServings(newInitialServings);
    setCheckedIngredients(new Set());
    if (user) {
      setIsFavorite(isFavoriteRecipe(recipe.id.toString(), user.uid));
    }
  }, [recipe, user]);

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
    // The name properties must be lowercase to match the keys in chartConfig
    return [
      { name: 'protein', value: parseInt(recipe.nutrition.protein, 10) || 0 },
      { name: 'carbohydrates', value: parseInt(recipe.nutrition.carbohydrates, 10) || 0 },
      { name: 'fat', value: parseInt(recipe.nutrition.fat, 10) || 0 },
      { name: 'fiber', value: parseInt(recipe.nutrition.fiber, 10) || 0 },
      { name: 'sugar', value: parseInt(recipe.nutrition.sugar, 10) || 0 },
    ];
  }, [recipe]);

  const handleLanguageChange = useCallback(async (newLanguage: string) => {
    if (isProcessing || !recipe) return;
    
    setIsTranslating(true);
    setLanguage(newLanguage);
    setServings(initialServings);
    setDisplayedPrepTime(recipe.prepTime);
    setDisplayedCookTime(recipe.cookTime);
    
    try {
        if (newLanguage === 'english') {
            setDisplayedIngredients(recipe.ingredients);
            setDisplayedInstructions(recipe.instructions);
        } else {
            const result = await translateRecipe({
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                targetLanguage: newLanguage,
            });
            
            if (result.translatedIngredients && result.translatedInstructions) {
                setDisplayedIngredients(result.translatedIngredients);
                setDisplayedInstructions(result.translatedInstructions);
            } else {
                throw new Error("AI did not return a translated recipe.");
            }
        }
    } catch (error) {
        console.error("Failed to translate recipe:", error);
        toast({
            variant: "destructive",
            title: "Translation Failed",
            description: "Could not translate the recipe. Please try again.",
        });
        setLanguage('english'); 
        setDisplayedIngredients(recipe.ingredients); 
        setDisplayedInstructions(recipe.instructions);
    } finally {
        setIsTranslating(false);
    }
}, [isProcessing, recipe, initialServings, toast]);

  const handleServingsChange = useCallback(async (newServings: number) => {
    if (newServings < 1 || isProcessing || !recipe) return;

    setServings(newServings);

    if (newServings === initialServings) {
      setDisplayedIngredients(recipe.ingredients);
      setDisplayedInstructions(recipe.instructions);
      setDisplayedPrepTime(recipe.prepTime);
      setDisplayedCookTime(recipe.cookTime);
      return;
    }

    setIsAdjusting(true);

    try {
      const result = await adjustRecipe({
        originalIngredients: recipe.ingredients,
        originalInstructions: recipe.instructions,
        originalServings: initialServings,
        newServings: newServings,
        originalPrepTime: recipe.prepTime,
        originalCookTime: recipe.cookTime,
      });
      if (result.adjustedIngredients && result.adjustedInstructions && result.adjustedPrepTime && result.adjustedCookTime) {
        setDisplayedIngredients(result.adjustedIngredients);
        setDisplayedInstructions(result.adjustedInstructions);
        setDisplayedPrepTime(result.adjustedPrepTime);
        setDisplayedCookTime(result.adjustedCookTime);
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
  }, [isProcessing, initialServings, recipe, servings, toast]);

  const handleAdaptRecipe = async () => {
    if (!adaptRequest.trim() || isProcessing) return;
    
    setIsAdapting(true);
    setAdaptationSummary(null);

    try {
        const result = await adaptRecipe({
            request: adaptRequest,
            originalTitle: recipe.title,
            originalIngredients: recipe.ingredients,
            originalInstructions: recipe.instructions,
        });
        if (result) {
            setDisplayedTitle(result.adaptedTitle);
            setDisplayedIngredients(result.adaptedIngredients);
            setDisplayedInstructions(result.adaptedInstructions);
            setAdaptationSummary(result.adaptationSummary);
            setIsAdapted(true);
            toast({
                title: "Recipe Adapted!",
                description: "The recipe has been updated with your changes.",
            });
        }
    } catch (e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Adaptation Failed',
            description: 'Could not adapt the recipe. Please try again.',
        });
    } finally {
        setIsAdapting(false);
    }
  };

  const resetAdaptation = () => {
    setRecipe(initialRecipe);
    setIsAdapted(false);
    setAdaptationSummary(null);
    setAdaptRequest('');
  };

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
      const languageForAI = language.charAt(0).toUpperCase() + language.slice(1);
      
      const result = await parseIngredientsForSearch({ 
          ingredients: ingredientsToOrder,
          language: languageForAI,
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

  const handleFavoriteToggle = () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Please log in",
            description: "You need to be logged in to favorite recipes.",
        });
        return;
    }
    if (isAdapted) {
        toast({
            variant: "destructive",
            title: "Cannot Favorite",
            description: "Please save or reset the adapted recipe before favoriting.",
        });
        return;
    }
    if (isFavorite) {
        removeFavoriteRecipe(recipe.id.toString(), user.uid);
        setIsFavorite(false);
        toast({ title: "Removed from favorites" });
    } else {
        addFavoriteRecipe(recipe, user.uid);
        setIsFavorite(true);
        toast({ title: "Added to favorites" });
    }
  };

  const handleStartCooking = () => {
    if (user && !isAdapted) {
      addPastRecipe(recipe, user.uid);
    }
  };

  const ServingsControl = () => {
    const isDisabled = language !== 'english' || isProcessing || isAdapted;
    const tooltipText = isAdapted ? "Reset the recipe to adjust servings." : "Servings can only be adjusted in English.";

    const control = (
        <div className="flex items-center gap-2 mt-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleServingsChange(servings - 1)} disabled={isDisabled || servings <= 1}>
                <Minus className="h-4 w-4" />
            </Button>
            <span className="text-foreground font-bold text-lg w-8 text-center">{servings}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleServingsChange(servings + 1)} disabled={isDisabled}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );

    if (isDisabled && !isProcessing) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>{control}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltipText}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    return control;
  }
  
  const checkAllergen = (ingredient: string): boolean => {
    if (!allergens.length) return false;
    const lowerIngredient = ingredient.toLowerCase();
    return allergens.some(allergen => lowerIngredient.includes(allergen));
  };
  
  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="p-0 relative h-64 md:h-96">
            <Image
              src={recipe.image}
              alt={displayedTitle}
              fill
              className="object-cover"
              sizes="100vw"
              data-ai-hint={recipe.imageHint}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{displayedTitle}</h1>
              <p className="mt-2 text-lg text-white/90 max-w-2xl drop-shadow-md">{recipe.description}</p>
            </div>
             <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" onClick={handleFavoriteToggle} className="rounded-full bg-background/50 hover:bg-background h-12 w-12">
                    <Heart className={cn("h-6 w-6 text-destructive", isFavorite && "fill-destructive")} />
                    <span className="sr-only">Favorite</span>
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto relative">
                <div className="absolute top-20 -left-16 text-doodle -z-10 animate-float-1 lg:block hidden">
                    <ChefHat className="h-48 w-48" />
                </div>
                <div className="absolute top-1/3 -right-16 text-doodle -z-10 animate-float-2 lg:block hidden">
                    <Carrot className="h-40 w-40" />
                </div>
                <div className="absolute bottom-1/4 -left-12 text-doodle -z-10 animate-float-3 lg:block hidden">
                    <Apple className="h-32 w-32" />
                </div>
                <div className="absolute bottom-0 -right-12 text-doodle -z-10 animate-float-4 lg:block hidden">
                    <Leaf className="h-36 w-36" />
                </div>
              <div className="relative">
                {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 font-semibold">
                            {isAdapting ? 'Adapting recipe...' : isAdjusting ? 'Adjusting recipe...' : 'Translating...'}
                        </span>
                    </div>
                )}
                
                {allergens.length > 0 && !isAdapted && (
                  <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700 dark:text-yellow-200">
                          <span className="font-medium">Allergen Warning:</span> This recipe contains ingredients with common allergens: <span className="capitalize font-semibold">{allergens.join(', ')}</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {isAdapted && adaptationSummary && (
                    <Alert className="mb-8 border-primary">
                        <Bot className="h-4 w-4"/>
                        <AlertTitle>This Recipe has been Adapted!</AlertTitle>
                        <AlertDescription className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold italic">Savora's Suggestion: "{adaptationSummary}"</p>
                                <p>This is a temporary version. You can reset to the original recipe.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={resetAdaptation}>Reset to Original</Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 text-center">
                  <div className="relative group flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-secondary">
                    <Clock className="absolute -top-2 -left-2 h-16 w-16 text-primary/10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Clock className="h-8 w-8 text-primary mb-2" />
                      <span className="font-bold">Prep Time</span>
                      <span className="text-muted-foreground">{displayedPrepTime}</span>
                    </div>
                  </div>

                  <div className="relative group flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-secondary">
                    <Flame className="absolute -top-2 -right-2 h-16 w-16 text-primary/10 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Flame className="h-8 w-8 text-primary mb-2" />
                      <span className="font-bold">Cook Time</span>
                      <span className="text-muted-foreground">{displayedCookTime}</span>
                    </div>
                  </div>

                  <div className="relative group flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-secondary">
                    <Users className="absolute -bottom-2 -left-2 h-16 w-16 text-primary/10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-primary mb-2" />
                      <span className="font-bold">Servings</span>
                      <ServingsControl />
                    </div>
                  </div>

                  <div className="relative group flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-secondary">
                    <Languages className="absolute -bottom-2 -left-2 h-16 w-16 text-primary/10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        <Languages className="h-8 w-8 text-primary mb-2" />
                        <span className="font-bold">Language</span>
                        <Select onValueChange={handleLanguageChange} defaultValue="english" disabled={isProcessing || isAdapted}>
                            <SelectTrigger className="w-[120px] mt-1">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="spanish">Español</SelectItem>
                                <SelectItem value="french">Français</SelectItem>
                                <SelectItem value="german">Deutsch</SelectItem>
                                <SelectItem value="hindi">हिन्दी</SelectItem>
                                <SelectItem value="bengali">বাংলা</SelectItem>
                            </SelectContent>
                        </Select>
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
                  <ol className="space-y-4">
                    {displayedInstructions.map((step, index) => (
                      <InstructionStep key={index} step={step} index={index} />
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
                              <span className={cn(checkAllergen(ingredient) && "font-bold text-destructive")}>{ingredient}</span>
                              {checkAllergen(ingredient) && <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />}
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
                                        className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", checkAllergen(ingredient) && "text-destructive")}
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

                    <AccordionItem value="adapt" className="border-none rounded-lg bg-secondary/30 overflow-hidden">
                        <AccordionTrigger className="text-xl font-bold px-6 py-4 hover:no-underline">
                            <div className="flex items-center gap-3">
                            <WandSparkles className="h-6 w-6 text-primary" />
                            Adapt Recipe
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 bg-background/50">
                            <div className="pt-4 pb-4 border-t space-y-4">
                                <p className="text-muted-foreground">Want to change things up? Ask Savora to adapt this recipe for you.</p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input 
                                        placeholder="e.g., 'make it vegan' or 'add a spicy kick'" 
                                        value={adaptRequest}
                                        onChange={(e) => setAdaptRequest(e.target.value)}
                                        disabled={isProcessing}
                                    />
                                    <Button onClick={handleAdaptRecipe} disabled={isAdapting || !adaptRequest.trim()}>
                                        {isAdapting ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Adapt'}
                                    </Button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                  </Accordion>
                </div>


                {hasMounted && (
                  <div ref={voiceAssistantRef} className="pt-8 mt-8 border-t">
                    <VoiceAssistant
                      recipeTitle={displayedTitle}
                      instructions={displayedInstructions}
                      language={language}
                      onStartCooking={handleStartCooking}
                    />
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


export default function RecipePage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const recipe = slug ? getRecipeBySlug(slug) : undefined;

  if (!hasMounted) {
    return <RecipePageSkeleton />;
  }

  if (!recipe) {
    notFound();
    return null;
  }

  return <RecipeView recipe={recipe} />;
}
