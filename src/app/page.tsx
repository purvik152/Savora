
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { Recipe, recipes } from '@/lib/recipes';

const featuredRecipes = [
  {
    name: 'Ultimate Creamy Tomato Pasta',
    image: 'https://placehold.co/636x393.png',
    hint: 'creamy pasta',
    description: 'A rich and decadent pasta dish that comes together in under 30 minutes.',
    href: '/recipes/creamy-tomato-pasta',
  },
  {
    name: 'Lemon Herb Roast Chicken',
    image: 'https://placehold.co/636x393.png',
    hint: 'roast chicken',
    description: 'Impressive enough for guests, easy enough for a weeknight.',
    href: '/recipes/lemon-herb-roast-chicken',
  },
  {
    name: 'Classic Beef Lasagna',
    image: 'https://placehold.co/636x393.png',
    hint: 'lasagna dinner',
    description: 'Layers of rich meat sauce, creamy béchamel, and tender pasta.',
    href: '/recipes/classic-beef-lasagna',
  },
   {
    name: 'Thai Green Curry',
    image: 'https://placehold.co/636x393.png',
    hint: 'thai curry',
    description: 'Fragrant and spicy Thai green curry with tender chicken and vegetables.',
    href: '/recipes/thai-green-curry-chicken',
  }
];

const subCategories = [
  { name: 'Quick and Easy', href: '/recipes?q=quick', image: 'https://placehold.co/636x393.png', hint: 'quick meal' },
  { name: 'Dinner', href: '/recipes?q=dinner', image: 'https://placehold.co/636x393.png', hint: 'salmon dinner' },
  { name: 'Vegetarian', href: '/recipes?q=vegetarian', image: 'https://placehold.co/636x393.png', hint: 'vegetarian dish' },
  { name: 'Healthy', href: '/recipes?q=healthy', image: 'https://placehold.co/636x393.png', hint: 'healthy food' },
  { name: 'Instant Pot', href: '/recipes?q=instant pot', image: 'https://placehold.co/636x393.png', hint: 'pot roast' },
  { name: 'Vegan', href: '/recipes?q=vegan', image: 'https://placehold.co/636x393.png', hint: 'vegan pasta' },
  { name: 'Meal Prep', href: '/recipes?q=meal prep', image: 'https://placehold.co/636x393.png', hint: 'meal prep' },
  { name: 'Soups', href: '/recipes?q=soup', image: 'https://placehold.co/636x393.png', hint: 'tortilla soup' },
  { name: 'Salads', href: '/recipes?q=salad', image: 'https://placehold.co/636x393.png', hint: 'fresh salad' },
];

const mainCategories = [
  {
    name: 'Quick and Easy',
    href: '/recipes?q=quick',
    image: 'https://placehold.co/636x393.png',
    hint: 'chicken rice bowl',
  },
  {
    name: 'Dinner',
    href: '/recipes?q=dinner',
    image: 'https://placehold.co/636x393.png',
    hint: 'creamy pasta',
  },
  {
    name: 'Most Popular',
    href: '/recipes?q=pasta',
    image: 'https://placehold.co/636x393.png',
    hint: 'noodle stirfry',
  },
  {
    name: 'Salads',
    href: '/recipes?q=salad',
    image: 'https://placehold.co/636x393.png',
    hint: 'salad bowl',
  },
];


export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const handleSearch = useCallback((query: string) => {
    if (query.trim().length > 1) {
        setIsSearching(true);
        const queryLower = query.toLowerCase();
        const filteredResults = recipes.filter(
            (recipe) =>
            recipe.title.toLowerCase().includes(queryLower) ||
            recipe.description.toLowerCase().includes(queryLower) ||
            recipe.cuisine.toLowerCase().includes(queryLower) ||
            recipe.category.toLowerCase().includes(queryLower)
        );
        
        setTimeout(() => {
            setSearchResults(filteredResults);
            setIsSearching(false);
        }, 300);
    } else {
        setSearchResults([]);
    }
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
      const timerId = setTimeout(() => {
          handleSearch(searchQuery);
      }, 300);

      return () => clearTimeout(timerId);
  }, [searchQuery, handleSearch]);


  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recipes?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const subCategoriesRow1 = subCategories.slice(0, 4);
  const subCategoriesRow2 = subCategories.slice(4, 9);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      
      {/* Hero Carousel Section */}
      <section className="mb-16">
        {hasMounted ? (
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent>
              {featuredRecipes.map((recipe, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[450px] w-full overflow-hidden rounded-lg bg-secondary">
                    <Link href={recipe.href} className="block h-full w-full group">
                      <Image
                        src={recipe.image}
                        alt={recipe.name}
                        fill
                        sizes="100vw"
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        data-ai-hint={recipe.hint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                        <h2 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg animate-zoom-in">{recipe.name}</h2>
                        <p className="mt-2 text-lg max-w-xl drop-shadow-md">{recipe.description}</p>
                      </div>
                    </Link>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="relative h-[450px] w-full overflow-hidden rounded-lg bg-secondary">
            <div className="w-full h-full bg-muted animate-pulse" />
          </div>
        )}
      </section>

      {/* Sub-Categories Section */}
      <section className="mb-16">
        <div className="flex flex-col items-center gap-y-12">
          <div className="flex flex-wrap items-start justify-center gap-x-8 md:gap-x-12 lg:gap-x-16">
            {subCategoriesRow1.map((category) => (
              <Link key={category.name} href={category.href} className="group flex flex-col items-center gap-3 text-center w-28">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                      data-ai-hint={category.hint}
                    />
                  </div>
                  <span className="font-body text-sm font-bold uppercase tracking-wider text-foreground">
                    {category.name}
                  </span>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-start justify-center gap-x-8 md:gap-x-12 lg:gap-x-16">
            {subCategoriesRow2.map((category) => (
              <Link key={category.name} href={category.href} className="group flex flex-col items-center gap-3 text-center w-28">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                      data-ai-hint={category.hint}
                    />
                  </div>
                  <span className="font-body text-sm font-bold uppercase tracking-wider text-foreground">
                    {category.name}
                  </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {mainCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group relative block h-[450px] w-full overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                data-ai-hint={category.hint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-colors" />
                <div className="absolute bottom-0 w-full p-4 text-center">
                    <div className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-bold uppercase tracking-widest">
                        {category.name}
                    </div>
                </div>
            </Link>
            ))}
        </div>
    </section>

    {/* Search Section */}
    <section className="my-24">
      <div className="bg-card border rounded-lg p-8 md:p-12 shadow-xl">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center gap-6">
          <div className="relative w-full">
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <Input
                type="search"
                placeholder="I want to make..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-md text-base"
                autoComplete="off"
              />
            </form>
            {searchQuery.trim().length > 1 && (
              <div className="absolute top-full mt-2 w-full bg-background border rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding recipes...
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {searchResults.slice(0, 7).map((recipe) => (
                      <li key={recipe.id}>
                        <Link
                          href={`/recipes/${recipe.slug}`}
                          className="flex items-center gap-4 p-3 hover:bg-secondary/50 transition-colors"
                        >
                            <Image
                              src={recipe.image}
                              alt={recipe.title}
                              width={48}
                              height={48}
                              className="rounded-md object-cover w-12 h-12"
                              data-ai-hint={recipe.imageHint}
                            />
                            <span className="font-medium">{recipe.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No recipes found for &quot;{searchQuery}&quot;.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-muted-foreground italic">or</span>
            <Link href="/recipes" passHref>
              <Button
                size="lg"
                className="h-12 px-6 font-bold uppercase tracking-wider"
              >
                + View All Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
      
    </div>
  );
}
