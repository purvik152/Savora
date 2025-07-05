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

// Data for main categories
const mainCategories = [
  {
    name: 'Salads',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&h=800&fit=crop',
    hint: 'salad chicken strawberry',
    href: '/recipes?q=salad',
  },
  {
    name: 'Most Popular',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&h=800&fit=crop',
    hint: 'noodles stirfry',
    href: '/recipes',
  },
  {
    name: 'Dinner',
    image: 'https://images.unsplash.com/photo-1598866594240-a3b5a9502621?q=80&w=600&h=800&fit=crop',
    hint: 'pasta dinner',
    href: '/recipes?q=dinner',
  },
  {
    name: 'Quick and Easy',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=600&h=800&fit=crop',
    hint: 'rice bowl chicken',
    href: '/recipes',
  },
];

// Data for sub-categories
const subCategories = [
  { name: 'Quick and Easy', image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=150&h=150&fit=crop', hint: 'rice bowl', href: '/recipes' },
  { name: 'Dinner', image: 'https://images.unsplash.com/photo-1598866594240-a3b5a9502621?q=80&w=150&h=150&fit=crop', hint: 'pasta dinner', href: '/recipes?q=dinner' },
  { name: 'Vegetarian', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=150&h=150&fit=crop', hint: 'vegetarian tacos', href: '/recipes?q=vegetarian' },
  { name: 'Healthy', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=150&h=150&fit=crop', hint: 'healthy food', href: '/recipes?q=healthy' },
  { name: 'Instant Pot', image: 'https://images.unsplash.com/photo-1590520623413-5858b091f043?q=80&w=150&h=150&fit=crop', hint: 'instant pot stew', href: '/recipes?q=instant%20pot' },
  { name: 'Vegan', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&h=150&fit=crop', hint: 'vegan salad', href: '/recipes?q=vegan' },
  { name: 'Meal Prep', image: 'https://images.unsplash.com/photo-1587329326493-9c504a37936a?q=80&w=150&h=150&fit=crop', hint: 'meal prep containers', href: '/recipes?q=meal%20prep' },
  { name: 'Soups', image: 'https://images.unsplash.com/photo-1534947817208-8c13b3f6f14b?q=80&w=150&h=150&fit=crop', hint: 'soup bowl', href: '/recipes?q=soup' },
  { name: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=150&h=150&fit=crop', hint: 'salad bowl', href: '/recipes?q=salad' },
];

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      
      {/* Hero Carousel Section */}
      <section className="mb-16">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent>
            {featuredRecipes.map((recipe, index) => (
              <CarouselItem key={index}>
                <div className="h-[450px] w-full overflow-hidden rounded-lg">
                  <Link href={recipe.href} className="relative block w-full h-full group">
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
      <section className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <Image
                src={category.image}
                alt={category.name}
                width={600}
                height={800}
                className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={category.hint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4/5 text-center">
                <span className="bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold tracking-wider uppercase shadow-lg">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sub-Categories Section */}
      <section>
        <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-10">
          {subCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group flex flex-col items-center gap-3 text-center w-24">
              <div className="relative h-24 w-24">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="rounded-full object-cover border-4 border-background shadow-md group-hover:border-primary transition-all duration-300"
                  data-ai-hint={category.hint}
                />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
      
    </div>
  );
}
