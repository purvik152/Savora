
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export function CookbookCta() {
  return (
    <Link href="/recipes" className="block h-full group">
        <Card className="relative overflow-hidden h-full min-h-[300px] shadow-xl transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-105">
            <div className="relative w-full h-full">
                <Image 
                    src="/images/recipes/recipe-bookk.jpg"
                    alt="Top 25 Recipes Cookbook"
                    fill
                    className="object-cover"
                    data-ai-hint="meal prep containers"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-purple-900/50 flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-5xl font-extrabold text-white uppercase drop-shadow-md">
                        Top 25 Recipes
                    </h2>
                    <p className="text-2xl font-semibold text-white/90 uppercase tracking-widest drop-shadow-sm">Cookbook</p>
                </div>
            </div>
        </Card>
    </Link>
  );
}
