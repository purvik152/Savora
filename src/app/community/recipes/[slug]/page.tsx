'use client';

import { notFound, useParams } from 'next/navigation';
import { getCommunityRecipes, CommunityRecipe } from '@/lib/community-recipes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Users, ArrowUp, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function CommunityRecipePage() {
    const params = useParams<{ slug: string }>();
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
                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-bold">This is a community recipe!</h2>
                        <p className="text-muted-foreground">Full ingredient and instruction details would be displayed here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default CommunityRecipePage;
