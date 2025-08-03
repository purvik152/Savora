
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recipe } from "@/lib/recipes";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginSuggestionDialog } from "../common/LoginSuggestionDialog";

interface RecipeCardProps {
    recipe: Recipe;
    animationDelay?: string;
}

export function RecipeCard({ recipe, animationDelay }: RecipeCardProps) {
    const { user } = useUser();
    const router = useRouter();
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!user) {
            e.preventDefault();
            setShowLoginDialog(true);
        }
    };

    const handleContinue = () => {
        setShowLoginDialog(false);
        router.push(`/recipes/${recipe.slug}`);
    };

    return (
        <>
        <div onClick={handleClick} className="h-full cursor-pointer">
            <Link href={`/recipes/${recipe.slug}`} className="block h-full animate-fade-in-up pointer-events-none" style={{ animationDelay }}>
                <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group">
                    <CardHeader className="p-0 border-b">
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
                        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{recipe.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-2 border-t">
                            <span>{recipe.cuisine}</span>
                            <span>{recipe.cookTime}</span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
        <LoginSuggestionDialog
            open={showLoginDialog}
            onOpenChange={setShowLoginDialog}
            onContinue={handleContinue}
        />
        </>
    );
}
