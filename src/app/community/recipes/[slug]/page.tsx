
'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { getCommunityRecipes, CommunityRecipe, removeCommunityRecipe } from '@/lib/community-recipes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Users, ArrowUp, Award, Check, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function CommunityRecipePage() {
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params?.slug;
    const [recipe, setRecipe] = useState<CommunityRecipe | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            const allRecipes = getCommunityRecipes();
            const foundRecipe = allRecipes.find(r => r.slug === slug);
            setRecipe(foundRecipe);
        }
        setLoading(false);
    }, [slug]);
    
    const handleRemoveRecipe = () => {
        if (!recipe) return;
        removeCommunityRecipe(recipe.id);
        toast({
            title: "Recipe Removed",
            description: `"${recipe.title}" has been removed.`,
        });
        router.push('/community');
    };

    if (loading) {
        return (
            <div className="container mx-auto flex h-full flex-col items-center justify-center px-4 py-8 md:py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (!recipe) {
        notFound();
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-16">
            <Card>
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
                    <div className="absolute top-4 right-4 z-10">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Delete Recipe</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this recipe
                                from the community kitchen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleRemoveRecipe}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <div className="absolute bottom-0 left-0 p-6 md:p-8">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{recipe.title}</h1>
                        <div className="flex items-center gap-2 mt-4">
                            <Avatar className="h-10 w-10 border-2 border-primary">
                                <AvatarImage src={recipe.submitter.avatar} data-ai-hint="user avatar" />
                                <AvatarFallback>{recipe.submitter.name.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-white font-semibold">Submitted by {recipe.submitter.name}</p>
                                <div className="flex items-center gap-4 text-white/90 text-sm">
                                    <div className="flex items-center gap-1">
                                        <ArrowUp className="h-4 w-4" /> {recipe.upvotes} upvotes
                                    </div>
                                    {recipe.isTopContributor && (
                                        <div className="flex items-center gap-1">
                                            <Award className="h-4 w-4 text-yellow-400" /> Top Contributor
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <p className="text-lg text-muted-foreground">{recipe.description}</p>
                    
                    {recipe.ingredients && recipe.instructions && recipe.ingredients.length > 0 && recipe.instructions.length > 0 ? (
                         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    ) : (
                        <div className="mt-8 text-center bg-secondary/50 p-8 rounded-lg">
                            <h2 className="text-2xl font-bold">This is a community recipe!</h2>
                            <p className="text-muted-foreground">The creator has not added detailed ingredients and instructions yet.</p>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}

export default CommunityRecipePage;
