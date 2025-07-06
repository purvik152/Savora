
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from 'react';

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

const mainCategories = [
  {
    name: 'Salads',
    href: '/recipes?q=salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&h=800&fit=crop',
    hint: 'salad bowl',
  },
  {
    name: 'Most Popular',
    href: '/recipes?q=pasta',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&h=800&fit=crop',
    hint: 'noodle stirfry',
  },
  {
    name: 'Dinner',
    href: '/recipes?q=dinner',
    image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=600&h=800&fit=crop',
    hint: 'creamy pasta',
  },
  {
    name: 'Quick and Easy',
    href: '/recipes?q=quick',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983d34?q=80&w=600&h=800&fit=crop',
    hint: 'chicken rice bowl',
  },
];


export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

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
      
    </div>
  );
}
