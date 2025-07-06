
'use client';

import { notFound, useParams } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, CheckCircle, Mic } from "lucide-react";
import { getRecipeBySlug } from '@/lib/recipes';
import { VoiceAssistant } from '@/components/recipes/VoiceAssistant';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function RecipePage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const recipe = getRecipeBySlug(slug);
  const voiceAssistantRef = useRef<HTMLDivElement>(null);

  if (!recipe) {
    notFound();
  }

  const handleScrollToVoiceAssistant = () => {
    voiceAssistantRef.current?.scrollIntoView({ behavior: 'smooth' });
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
              <div className="md:col-span-2">
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
                    <span className="text-muted-foreground">{recipe.servings}</span>
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
                    {recipe.instructions.map((step, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
                        <p className="flex-1 text-base text-foreground/90">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div ref={voiceAssistantRef} className="pt-8 mt-8 border-t">
                  <VoiceAssistant recipeTitle={recipe.title} instructions={recipe.instructions} />
                </div>
              </div>

              <div>
                <div className="sticky top-24">
                  <Card className="bg-secondary/30">
                    <CardHeader>
                      <h3 className="text-xl font-bold">Ingredients</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient, index) => (
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
