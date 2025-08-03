
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/lib/recipes';
import { Bot } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSuggestionDialog } from '../common/LoginSuggestionDialog';

interface SuggestionCardProps {
  recipe: Recipe;
  reason: string;
}

export function SuggestionCard({ recipe, reason }: SuggestionCardProps) {
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
      <div onClick={handleClick} className="h-full">
        <Link href={`/recipes/${recipe.slug}`} className="pointer-events-none">
            <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group cursor-pointer">
            <CardHeader className="p-0">
                <div className="relative w-full h-48">
                    <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out rounded-t-lg"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    data-ai-hint={recipe.imageHint}
                    />
                </div>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col p-4">
                <Badge variant="secondary" className="mb-2 w-fit">{recipe.cuisine}</Badge>
                <CardTitle className="text-xl font-semibold mb-2 line-clamp-2">
                <span className="hover:underline">{recipe.title}</span>
                </CardTitle>
                <div className="mt-auto pt-4 border-t border-dashed">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="italic">"{reason}"</p>
                    </div>
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
