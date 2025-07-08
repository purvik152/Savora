import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from '@/lib/recipes';
import { Bot } from 'lucide-react';

interface SuggestionCardProps {
  recipe: Recipe;
  reason: string;
}

export function SuggestionCard({ recipe, reason }: SuggestionCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group">
      <CardHeader className="p-0">
        <Link href={`/recipes/${recipe.slug}`} className="block h-full">
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
        </Link>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col p-4">
        <Badge variant="secondary" className="mb-2 w-fit">{recipe.cuisine}</Badge>
        <CardTitle className="text-xl font-semibold mb-2 line-clamp-2">
           <Link href={`/recipes/${recipe.slug}`} className="hover:underline">{recipe.title}</Link>
        </CardTitle>
        <div className="mt-auto pt-4 border-t border-dashed">
             <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="italic">"{reason}"</p>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
