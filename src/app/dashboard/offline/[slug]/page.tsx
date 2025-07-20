
'use client';

import { notFound, useParams } from 'next/navigation';
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Flame, Check, AlertCircle } from "lucide-react";
import type { OfflineRecipe } from '@/lib/user-data';
import { getOfflineRecipe } from '@/lib/user-data';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


function OfflineRecipePageSkeleton() {
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
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
              <div className="mb-8">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="space-y-6">
                  <Skeleton className="h-6 w-full rounded-md" />
                  <Skeleton className="h-6 w-11/12 rounded-md" />
                </div>
              </div>
               <div className="mt-12">
                   <div className="space-y-4">
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


function OfflineRecipeView({ recipe }: { recipe: OfflineRecipe }) {
  
  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded-r-lg" role="alert">
            <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-3"/>
                <div>
                    <p className="font-bold">Offline Mode</p>
                    <p className="text-sm">You are viewing a downloaded version of this recipe. Some features may be disabled.</p>
                </div>
            </div>
        </div>

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
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 text-center">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                      <Clock className="h-8 w-8 text-primary mb-2 mx-auto" />
                      <span className="font-bold">Prep Time</span>
                      <span className="text-muted-foreground block">{recipe.prepTime}</span>
                  </div>
                   <div className="p-4 bg-secondary/50 rounded-lg">
                      <Flame className="h-8 w-8 text-primary mb-2 mx-auto" />
                      <span className="font-bold">Cook Time</span>
                      <span className="text-muted-foreground block">{recipe.cookTime}</span>
                   </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <Users className="h-8 w-8 text-primary mb-2 mx-auto" />
                        <span className="font-bold">Servings</span>
                        <span className="text-muted-foreground block">{recipe.servings}</span>
                    </div>
                </div>

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
                                <li key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
                                    <p className="flex-1 text-base text-foreground/90">{step}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
                
                 <div className="mt-12 pt-8 border-t">
                    <h2 className="text-2xl font-bold mb-4 text-center">Voice Narration</h2>
                    {recipe.audioDataUri ? (
                        <audio controls className="w-full">
                            <source src={recipe.audioDataUri} type="audio/wav" />
                            Your browser does not support the audio element.
                        </audio>
                    ) : (
                        <p className="text-center text-muted-foreground">Voice narration was not downloaded for this recipe.</p>
                    )}
                 </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function OfflineRecipePage() {
  const [recipe, setRecipe] = useState<OfflineRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams<{ slug: string }>();
  const MOCK_USER_ID = 'mock-user-id'; // Mock user ID

  useEffect(() => {
    if (params?.slug) {
        const offlineRecipe = getOfflineRecipe(params.slug, MOCK_USER_ID);
        if (offlineRecipe) {
            setRecipe(offlineRecipe);
        }
    }
    setLoading(false);
  }, [params?.slug]);

  if (loading) {
    return <OfflineRecipePageSkeleton />;
  }
  
  if (!recipe) {
    notFound();
    return null;
  }

  return <OfflineRecipeView recipe={recipe} />;
}
