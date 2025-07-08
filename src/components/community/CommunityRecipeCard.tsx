'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, Award, Loader2 } from 'lucide-react';
import type { CommunityRecipe } from '@/lib/community-recipes';
import { upvoteRecipe as upvoteRecipeAction } from '@/lib/community-recipes';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CommunityRecipeCardProps {
  recipe: CommunityRecipe;
  onUpvote: (recipeId: number) => void;
}

export function CommunityRecipeCard({ recipe, onUpvote }: CommunityRecipeCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const { toast } = useToast();

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUpvoting(true);

    // Simulate network delay
    await new Promise(res => setTimeout(res, 300));

    // This is a local-only action for the prototype.
    upvoteRecipeAction(recipe.id);
    onUpvote(recipe.id);
    
    setIsUpvoting(false);
    toast({ title: `Upvoted "${recipe.title}"!` });
  };

  return (
    <Link href={`/community/recipes/${recipe.slug}`} className="block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group">
        <CardHeader className="p-0">
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
      </Card>
    </Link>
  );
}
