
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, Award, Loader2, Trash2, Download } from 'lucide-react';
import type { CommunityRecipe } from '@/lib/community-recipes';
import { upvoteRecipe as upvoteRecipeAction } from '@/lib/community-recipes';
import { useToast } from '@/hooks/use-toast';
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
import { saveCommunityRecipeForOffline, isRecipeAvailableOffline } from '@/lib/user-data';
import { cn } from '@/lib/utils';

interface CommunityRecipeCardProps {
  recipe: CommunityRecipe;
  onUpvote: (recipeId: number) => void;
  onRemove: (recipeId: number, recipeTitle: string) => void;
}

export function CommunityRecipeCard({ recipe, onUpvote, onRemove }: CommunityRecipeCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();
  const MOCK_USER_ID = 'mock-user-id';

  useEffect(() => {
    setIsOffline(isRecipeAvailableOffline(recipe.slug, MOCK_USER_ID));
  }, [recipe.slug]);

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUpvoting(true);

    await new Promise(res => setTimeout(res, 300));

    upvoteRecipeAction(recipe.id);
    onUpvote(recipe.id);
    
    setIsUpvoting(false);
    toast({ title: `Upvoted "${recipe.title}"!` });
  };
  
  const handleRemoveClick = () => {
    onRemove(recipe.id, recipe.title);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDownloading(true);
    try {
        await saveCommunityRecipeForOffline(recipe, MOCK_USER_ID);
        setIsOffline(true);
        toast({
            title: "Recipe Saved Offline",
            description: `"${recipe.title}" is now available for offline use.`
        });
    } catch (error) {
        console.error("Failed to save community recipe for offline:", error);
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not save the recipe for offline use. Please try again.'
        });
    } finally {
        setDownloading(false);
    }
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group">
        <div className="relative">
             <Link href={isOffline ? `/dashboard/offline/${recipe.slug}` : `/community/recipes/${recipe.slug}`} className="block h-full">
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
            </Link>
            <div className="absolute top-2 right-2 flex flex-col gap-2">
                <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleDownload}
                    disabled={isOffline || downloading}
                    className={cn("h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity", isOffline && "border-green-500 text-green-500 opacity-100")}
                    title={isOffline ? 'Available Offline' : 'Download for Offline Use'}
                >
                    {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the recipe for "{recipe.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemoveClick}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      <Link href={isOffline ? `/dashboard/offline/${recipe.slug}` : `/community/recipes/${recipe.slug}`} className="flex flex-col flex-grow">
        <CardContent className="flex flex-grow flex-col p-4">
          <CardTitle className="text-xl font-semibold mb-2 line-clamp-2">{recipe.title}</CardTitle>
          <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">{recipe.description}</p>
        </CardContent>
        <CardFooter className="p-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={recipe.submitter.avatar} data-ai-hint="user avatar" />
                    <AvatarFallback>{recipe.submitter.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                    <span className="font-semibold">{recipe.submitter.name}</span>
                    {recipe.isTopContributor && (
                        <Award className="inline-block ml-1 h-4 w-4 text-yellow-500" />
                    )}
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleUpvoteClick} disabled={isUpvoting}>
                {isUpvoting ? <Loader2 className="animate-spin" /> : <ArrowUp className="h-4 w-4 mr-1" />}
                {recipe.upvotes}
            </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
