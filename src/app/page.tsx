
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from 'react';
import { recipes, Recipe } from '@/lib/recipes';
import { Card, CardContent, CardTitle } from "@/components/ui/card";

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
  { name: 'Quick and Easy', image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=400&h=400&fit=crop', hint: 'rice bowl', href: '/recipes?q=quick' },
  { name: 'Dinner', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&h=400&fit=crop', hint: 'salmon dinner', href: '/recipes?q=dinner' },
  { name: 'Vegetarian', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=400&h=400&fit=crop', hint: 'vegetarian tacos', href: '/recipes?q=vegetarian' },
  { name: 'Healthy', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=400&h=400&fit=crop', hint: 'healthy food', href: '/recipes?q=healthy' },
  { name: 'Instant Pot', image: 'https://images.unsplash.com/photo-1542364746-339958a55430?q=80&w=400&h=400&fit=crop', hint: 'instant pot', href: '/recipes?q=instant%20pot' },
  { name: 'Vegan', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=400&fit=crop', hint: 'vegan salad', href: '/recipes?q=vegan' },
  { name: 'Meal Prep', image: 'https://images.unsplash.com/photo-1543353071-873f6b6a4a48?q=80&w=400&h=400&fit=crop', hint: 'meal prep', href: '/recipes?q=meal%20prep' },
  { name: 'Soups', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&h=400&fit=crop', hint: 'soup bowl', href: '/recipes?q=soup' },
  { name: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&h=400&fit=crop', hint: 'salad bowl', href: '/recipes?q=salad' },
];

const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Link href={`/recipes/${recipe.slug}`} className="block h-full">
        <Card className="flex h-full flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group">
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
        <CardContent className="flex flex-grow flex-col p-6">
            <CardTitle className="text-xl font-semibold mb-2 line-clamp-2">{recipe.title}</CardTitle>
            <p className="text-muted-foreground line-clamp-3 flex-grow">{recipe.description}</p>
        </CardContent>
        </Card>
    </Link>
);


export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  const saladRecipes = recipes.filter(r => r.title.toLowerCase().includes('salad'));

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

      {/* Salads Section */}
      <section className="mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Fresh & Flavorful Salads</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {saladRecipes.map((recipe) => (
             <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* Sub-Categories Section */}
      <section>
        <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-12">
          {subCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group flex flex-col items-center gap-3 text-center w-40">
              <div className="relative h-40 w-40">
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
