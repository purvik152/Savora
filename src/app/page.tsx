

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Users } from 'lucide-react';
import { recipes } from '@/lib/recipes';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDiet } from '@/contexts/DietContext';
import { CommunityRecipeCard } from '@/components/community/CommunityRecipeCard';
import { getCommunityRecipes, removeCommunityRecipe, CommunityRecipe } from '@/lib/community-recipes';
import { WhatsInYourKitchen } from '@/components/home/WhatsInYourKitchen';
import { SearchDialog } from '@/components/search/SearchDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const allFeaturedRecipes = [
  {
    name: 'Plan Your Week with AI',
    image: 'https://placehold.co/1200x550.png',
    hint: 'meal prep containers',
    description: 'Let our intelligent AI create a personalized weekly meal plan based on your diet, goals, and allergies.',
    href: '/meal-planner',
    diet: 'all'
  },
  {
    name: 'Cook with a Voice Assistant',
    image: 'https://placehold.co/1200x550.png',
    hint: 'kitchen cooking voice',
    description: 'Navigate recipes hands-free. Just tell Savora to start, stop, or go to the next step.',
    href: '/recipes/creamy-tomato-pasta',
    diet: 'all'
  },
  {
    name: 'Discover Recipes by Mood',
    image: 'https://placehold.co/1200x550.png',
    hint: 'comfort food cozy',
    description: 'Feeling cozy, energetic, or stressed? Our Mood Kitchen suggests the perfect dish for how you feel.',
    href: '/mood-kitchen',
    diet: 'all'
  },
  {
    name: 'Join the Community Kitchen',
    image: 'https://placehold.co/1200x550.png',
    hint: 'community cooking class',
    description: 'Share your own creations and discover new favorites from home cooks just like you.',
    href: '/community',
    diet: 'all'
  },
  {
    name: 'Take the Chef\'s Challenge',
    image: 'https://placehold.co/1200x550.png',
    hint: 'mystery box ingredients',
    description: 'Challenge our AI chef to invent a brand new recipe from a random set of ingredients.',
    href: '/chef-challenge',
    diet: 'all'
  },
];

const allSubCategories = [
  { name: 'Breakfast', href: '/recipes?q=breakfast', image: '/images/recipes/berry-smoothie-bowl.jpg', hint: 'smoothie bowl', diet: 'veg' },
  { name: 'Lunch', href: '/recipes?q=lunch', image: '/images/recipes/chicken-caesar-wrap.jpg', hint: 'lunch wrap', diet: 'non-veg' },
  { name: 'Dinner', href: '/recipes?q=dinner', image: '/images/recipes/easy-beef-stir-fry.jpg', hint: 'stir fry dinner', diet: 'non-veg' },
  { name: 'Indian', href: '/recipes?country=India', image: '/images/recipes/paneer-butter-masala.jpg', hint: 'paneer curry', diet: 'veg' },
  { name: 'Italian', href: '/recipes?country=Italy', image: '/images/recipes/classic-beef-lasagna.jpg', hint: 'lasagna dinner', diet: 'non-veg' },
  { name: 'Mexican', href: '/recipes?country=Mexico', image: '/images/recipes/classic-beef-tacos.jpg', hint: 'beef tacos', diet: 'non-veg' },
  { name: 'Thai', href: '/recipes?country=Thailand', image: '/images/recipes/thai-green-curry-chicken.jpg', hint: 'thai curry', diet: 'non-veg' },
  { name: 'Soups', href: '/recipes?q=soup', image: '/images/recipes/creamy-butternut-squash-soup.jpg', hint: 'squash soup', diet: 'veg' },
  { name: 'Salads', href: '/recipes?q=salad', image: '/images/recipes/greek-salad-with-grilled-chicken.jpg', hint: 'fresh salad', diet: 'non-veg' },
  { name: 'Quick & Easy', href: '/recipes?q=quick', image: '/images/recipes/caprese-sandwich.jpg', hint: 'quick meal', diet: 'veg' },
  { name: 'Healthy', href: '/recipes?q=healthy', image: '/images/recipes/sheet-pan-salmon-and-veggies.jpg', hint: 'salmon veggies', diet: 'non-veg' },
  { name: 'Desserts', href: '/recipes?q=dessert', image: '/images/recipes/perfect-lemon-tart.jpg', hint: 'lemon tart', diet: 'veg' },
];

const vegMainCategories = [
  { name: 'Indian Cuisine', href: '/recipes?country=India', image: '/images/recipes/palak-paneer.jpg', hint: 'palak paneer' },
  { name: 'Comfort Food', href: '/recipes?q=comfort', image: '/images/recipes/creamy-vegan-tomato-soup.jpg', hint: 'tomato soup' },
  { name: 'Italian Classics', href: '/recipes?country=Italy', image: '/images/recipes/creamy-mushroom-risotto.jpg', hint: 'mushroom risotto' },
  { name: 'Quick Bites', href: '/recipes?q=quick', image: '/images/recipes/caprese-sandwich.jpg', hint: 'sandwich' },
];

const nonVegMainCategories = [
  {
    name: 'Spanish Feasts',
    href: '/recipes?country=Spain',
    image: '/images/recipes/spanish-garlic-shrimp.jpg',
    hint: 'garlic shrimp',
  },
  {
    name: 'Japanese Ramen',
    href: '/recipes?country=Japan',
    image: '/images/recipes/tonkotsu-ramen.jpg',
    hint: 'ramen bowl',
  },
  {
    name: 'American Classics',
    href: '/recipes?country=USA',
    image: '/images/recipes/classic-beef-lasagna.jpg',
    hint: 'lasagna slice',
  },
  {
    name: 'Greek Delights',
    href: '/recipes?country=Greece',
    image: '/images/recipes/greek-lemon-chicken-potatoes.jpg',
    hint: 'lemon chicken',
  },
];

const testimonials = [
  {
    quote: "Savora has completely transformed how I approach weeknight dinners. The AI suggestions are genius and have gotten me out of my cooking rut!",
    name: "Jessica L.",
    title: "Busy Mom & Home Cook",
    avatar: "https://placehold.co/128x128.png",
    avatarHint: "woman portrait"
  },
  {
    quote: "The voice assistant is a game-changer. I can cook without constantly washing my hands to check my phone. It feels like I have a sous-chef in my kitchen.",
    name: "Om Barvaliya",
    title: "Tech Enthusiast & Foodie",
    avatar: '/images/recipes/Om Barvaliya.jpg',
    avatarHint: "man portrait"
  },
  {
    quote: "As a vegetarian, I love how easy it is to switch to a 'veg' view and discover new, exciting recipes. The Mood Kitchen is such a fun and unique feature!",
    name: "Priya Patel",
    title: "Food Blogger",
    avatar: "https://placehold.co/128x128.png",
    avatarHint: "woman smiling"
  }
];


export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  const router = useRouter();
  const { toast } = useToast();
  const { diet } = useDiet();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  // State for community recipes
  const [communityRecipes, setCommunityRecipes] = useState<CommunityRecipe[]>([]);

  const fetchCommunityRecipes = useCallback(() => {
    // Only fetch if running on the client
    if (typeof window !== 'undefined') {
      setCommunityRecipes(getCommunityRecipes());
    }
  }, []);

  useEffect(() => {
    setHasMounted(true);
    fetchCommunityRecipes();
  }, [fetchCommunityRecipes]);

  const featuredRecipes = useMemo(() => {
    if (diet === 'veg') {
      return allFeaturedRecipes.filter(r => r.diet === 'veg' || r.diet === 'all');
    }
    // In non-veg mode, show only non-veg recipes and the generic planner slide
    return allFeaturedRecipes.filter(r => r.diet === 'non-veg' || r.diet === 'all');
  }, [diet]);

  const subCategories = useMemo(() => {
    if (diet === 'veg') {
      return allSubCategories.filter(r => r.diet === 'veg');
    }
    // In non-veg mode, show only non-veg subcategories
    return allSubCategories.filter(r => r.diet === 'non-veg' || r.diet === 'veg'); // Show all for variety
  }, [diet]);

  const mainCategories = useMemo(() => {
    if (diet === 'veg') {
      return vegMainCategories;
    }
    return nonVegMainCategories;
  }, [diet]);

  const topCommunityRecipes = useMemo(() => {
    const filtered = diet === 'veg' 
        ? communityRecipes.filter(r => r.diet === 'veg') 
        : communityRecipes.filter(r => r.diet === 'non-veg');
    
    return filtered.sort((a,b) => b.upvotes - a.upvotes).slice(0, 3);
  }, [diet, communityRecipes]);

  const handleCommunityUpvote = (recipeId: number) => {
    fetchCommunityRecipes();
  };
  
  const handleRemoveCommunityRecipe = (recipeId: number, recipeTitle: string) => {
    removeCommunityRecipe(recipeId,);
    toast({
        title: "Recipe Removed",
        description: `"${recipeTitle}" has been removed from the community kitchen.`
    });
    fetchCommunityRecipes();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      
      {/* Hero Carousel Section */}
      <section className="mb-16 animate-fade-in-up">
        {hasMounted && featuredRecipes.length > 0 ? (
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent>
              {featuredRecipes.map((recipe, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[550px] w-full overflow-hidden rounded-sm bg-secondary">
                    <Link href={recipe.href} className="block h-full w-full group">
                        <Image
                          src={recipe.image}
                          alt={recipe.name}
                          fill
                          sizes="100vw"
                          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                          data-ai-hint={recipe.hint}
                          priority
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
          <Skeleton className="h-[550px] w-full rounded-sm" />
        )}
      </section>

      {/* Sub-Categories Section */}
      {subCategories.length > 0 && (
      <section
        className="mb-16 animate-fade-in-up"
        style={{ animationDelay: '200ms' }}
      >
        {hasMounted ? (
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategories.map((category, i) => (
                <Link key={category.name} href={category.href} className="group flex flex-col items-center gap-3 text-center w-36 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="relative h-36 w-36 overflow-hidden rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="144px"
                      data-ai-hint={category.hint}
                    />
                  </div>
                  <span className="font-body text-sm font-bold uppercase tracking-wider text-foreground">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
        ) : (
          <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategories.map((category) => (
                <div key={category.name} className="flex flex-col items-center gap-3 text-center w-36">
                  <Skeleton className="h-36 w-36 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              ))}
          </div>
        )}
      </section>
      )}

      {/* Main Categories Section */}
      {mainCategories.length > 0 && (
      <section
        className="animate-fade-in-up"
        style={{ animationDelay: '400ms' }}
      >
        {hasMounted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {mainCategories.map((category, i) => (
                <Link key={category.name} href={category.href} className="group relative block h-[450px] w-full overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
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
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {mainCategories.map((category) => (
                    <Skeleton key={category.name} className="h-[450px] w-full rounded-lg" />
                ))}
            </div>
        )}
    </section>
    )}

    {/* Search Section */}
    <section
      className="my-24 animate-fade-in-up"
      style={{ animationDelay: '600ms' }}
    >
      <div className="bg-card border rounded-lg p-8 md:p-12 shadow-xl">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center gap-6">
          <div className="relative w-full z-10">
            <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full h-12 px-4 flex items-center text-left bg-background border border-input rounded-lg text-base text-muted-foreground hover:bg-accent"
            >
                <Search className="h-5 w-5 mr-3" />
                I want to make...
            </button>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-muted-foreground italic">or</span>
            <Link href="/recipes">
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

    {/* What's in your Kitchen Section */}
    <section 
        className="my-24 animate-fade-in-up"
        style={{ animationDelay: '700ms' }}
    >
        <WhatsInYourKitchen />
    </section>

    {/* Community Section */}
    <section className="my-24 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">From Our Community Kitchen</h2>
            <p className="max-w-2xl mx-auto mt-2 text-muted-foreground">Top-rated recipes submitted by home cooks like you.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topCommunityRecipes.length > 0 ? topCommunityRecipes.map(recipe => (
                <CommunityRecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onUpvote={handleCommunityUpvote} 
                  onRemove={handleRemoveCommunityRecipe}
                />
            )) : (
                <p className="text-muted-foreground text-center col-span-full">No community recipes in this view yet.</p>
            )}
        </div>
        <div className="text-center mt-12">
            <Link href="/community">
                <Button size="lg">
                    <Users className="mr-2" />
                    Explore All Community Recipes
                </Button>
            </Link>
        </div>
    </section>

    {/* Testimonials Section */}
    <section className="my-24 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What Our Users Say</h2>
            <p className="max-w-2xl mx-auto mt-2 text-muted-foreground">
                Hear from home cooks who have found joy and inspiration with Savora.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
                <Card key={index} className="flex flex-col items-center text-center p-8 bg-secondary/50">
                    <Avatar className="w-20 h-20 mb-4 border-4 border-background">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.avatarHint} />
                        <AvatarFallback>{testimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardContent className="p-0">
                        <p className="text-foreground/90 italic mb-4">"{testimonial.quote}"</p>
                        <p className="font-bold text-primary">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </section>
    
    <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      
    </div>
  );
}
