
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export function CookbookCta() {
  return (
    <Link href="/cookbook" className="block h-full group">
        <Card className="overflow-hidden h-full min-h-[300px] shadow-xl transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-105 relative">
            <Image 
                src="/images/recipes/recipe-bookk.jpg"
                alt="Top 25 Recipes Cookbook"
                fill
                className="object-cover"
                data-ai-hint="cookbook open book"
                sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/50">
                
            </div>
        </Card>
    </Link>
  );
}
