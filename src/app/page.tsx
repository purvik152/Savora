'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FloatingDoodles } from '@/components/common/FloatingDoodles';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const featuredRecipes = [
  {
    name: 'Ultimate Creamy Tomato Pasta',
    image: 'https://images.unsplash.com/photo-1598866594240-a3b5a9502621?q=80&w=1200&h=500&fit=crop',
    hint: 'creamy pasta',
    description: 'A rich and decadent pasta dish that comes together in under 30 minutes.',
    href: '/recipes/creamy-tomato-pasta',
  },
  {
    name: 'Lemon Herb Roast Chicken',
    image: 'https://images.unsplash.com/photo-1598103442387-03379db382c3?q=80&w=1200&h=500&fit=crop',
    hint: 'roast chicken',
    description: 'Impressive enough for guests, easy enough for a weeknight.',
    href: '/recipes/lemon-herb-roast-chicken',
  },
  {
    name: 'Classic Beef Lasagna',
    image: 'https://images.unsplash.com/photo-1574894709920-31b2e3d5b706?q=80&w=1200&h=500&fit=crop',
    hint: 'lasagna dinner',
    description: 'Layers of rich meat sauce, creamy béchamel, and tender pasta.',
    href: '/recipes/classic-beef-lasagna',
  },
   {
    name: 'Thai Green Curry',
    image: 'https://images.unsplash.com/photo-1572455014639-9d96952d921b?q=80&w=1200&h=500&fit=crop',
    hint: 'thai curry',
    description: 'Fragrant and spicy Thai green curry with tender chicken and vegetables.',
    href: '/recipes/thai-green-curry-chicken',
  }
];

const subCategories = [
  { name: 'Quick and Easy', href: '/recipes?q=quick', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&h=200&fit=crop', hint: 'quick meal' },
  { name: 'Dinner', href: '/recipes?q=dinner', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=200&h=200&fit=crop', hint: 'penne pasta' },
  { name: 'Vegetarian', href: '/recipes?q=vegetarian', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17025?q=80&w=200&h=200&fit=crop', hint: 'vegetarian dish' },
  { name: 'Healthy', href: '/recipes?q=healthy', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=200&h=200&fit=crop', hint: 'healthy food' },
  { name: 'Instant Pot', href: '/recipes?q=instant pot', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=200&h=200&fit=crop', hint: 'tacos' },
  { name: 'Vegan', href: '/recipes?q=vegan', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=200&h=200&fit=crop', hint: 'vegan pasta' },
  { name: 'Meal Prep', href: '/recipes?q=meal prep', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=200&h=200&fit=crop', hint: 'meal prep' },
  { name: 'Soups', href: '/recipes?q=soup', image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=200&h=200&fit=crop', hint: 'tortilla soup' },
  { name: 'Salads', href: '/recipes?q=salad', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&h=200&fit=crop', hint: 'fresh salad' },
];

const mainCategories = [
  {
    name: 'Quick and Easy',
    href: '/recipes?q=quick',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983d34?q=80&w=600&h=800&fit=crop',
    hint: 'chicken rice bowl',
  },
  {
    name: 'Dinner',
    href: '/recipes?q=dinner',
    image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=600&h=800&fit=crop',
    hint: 'creamy pasta',
  },
  {
    name: 'Most Popular',
    href: '/recipes?q=pasta',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&h=800&fit=crop',
    hint: 'noodle stirfry',
  },
  {
    name: 'Salads',
    href: '/recipes?q=salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&h=800&fit=crop',
    hint: 'salad bowl',
  },
];


export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {featuredRecipes.map((recipe, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[450px] w-full overflow-hidden rounded-lg">
                  <Link href={recipe.href} className="block h-full w-full group">
                    <Image
                      src={recipe.image}
                      alt={recipe.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                      data-ai-hint={recipe.hint}
                      priority={index === 0}
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
      </section>

      {/* Sub-Categories Section */}
      <section className="mb-16 relative">
        <FloatingDoodles />
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
        <div className="bg-secondary/20 rounded-lg p-8 md:p-12">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6">
                <form
                    onSubmit={handleSearchSubmit}
                    className="relative w-full flex-grow md:flex-grow-0 md:w-80"
                >
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search our recipes"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-md text-base"
                    />
                </form>
                <span className="text-muted-foreground italic text-lg">or</span>
                <Link href="/recipes" passHref>
                    <Button size="lg" className="h-12 px-6 font-bold uppercase tracking-wider">
                    + View All Recipes
                    </Button>
                </Link>
            </div>
        </div>
    </section>
      
    </div>
  );
}
