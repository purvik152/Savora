
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Mic, Users } from 'lucide-react';
import { Recipe, recipes } from '@/lib/recipes';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useDiet } from '@/contexts/DietContext';
import { CommunityRecipeCard } from '@/components/community/CommunityRecipeCard';
import { getCommunityRecipes, removeCommunityRecipe, CommunityRecipe } from '@/lib/community-recipes';


const allFeaturedRecipes = [
  {
    name: 'Ultimate Creamy Tomato Pasta',
    image: '/images/recipes/creamy-tomato-pasta.jpg',
    hint: 'creamy pasta',
    description: 'A rich and decadent pasta dish that comes together in under 30 minutes.',
    href: '/recipes/creamy-tomato-pasta',
    diet: 'veg'
  },
  {
    name: 'Lemon Herb Roast Chicken',
    image: '/images/recipes/lemon-herb-roast-chicken.jpg',
    hint: 'roast chicken',
    description: 'Impressive enough for guests, easy enough for a weeknight.',
    href: '/recipes/lemon-herb-roast-chicken',
    diet: 'non-veg'
  },
  {
    name: 'Classic Beef Lasagna',
    image: '/images/recipes/classic-beef-lasagna.jpg',
    hint: 'lasagna dinner',
    description: 'Layers of rich meat sauce, creamy béchamel, and tender pasta.',
    href: '/recipes/classic-beef-lasagna',
    diet: 'non-veg'
  },
   {
    name: 'Thai Green Curry',
    image: '/images/recipes/thai-green-curry-chicken.jpg',
    hint: 'thai curry',
    description: 'Fragrant and spicy Thai green curry with tender chicken and vegetables.',
    href: '/recipes/thai-green-curry-chicken',
    diet: 'non-veg'
  },
  {
    name: 'Plan Your Week with Savora',
    image: '/images/recipes/meal-planner.jpg',
    hint: 'meal prep bowls',
    description: 'Easily organize your weekly meals, track nutrition, and stay on top of your health goals.',
    href: '/meal-planner',
    diet: 'all',
  },
];

const allSubCategories = [
  { name: 'Quick and Easy', href: '/recipes?q=quick', image: '/images/recipes/caprese-sandwich.jpg', hint: 'quick meal', diet: 'veg' },
  { name: 'Dinner', href: '/recipes?q=dinner', image: '/images/recipes/easy-beef-stir-fry.jpg', hint: 'stir fry dinner', diet: 'non-veg' },
  { name: 'Vegetarian', href: '/recipes?q=vegetarian', image: '/images/recipes/black-bean-burgers.jpg', hint: 'vegetarian dish', diet: 'veg' },
  { name: 'Healthy', href: '/recipes?q=healthy', image: '/images/recipes/vibrant-quinoa-salad.jpg', hint: 'healthy food', diet: 'veg' },
  { name: 'Instant Pot', href: '/recipes?q=instant pot', image: '/images/recipes/instant-pot-pot-roast.jpg', hint: 'pot roast', diet: 'non-veg' },
  { name: 'Vegan', href: '/recipes?q=vegan', image: '/images/recipes/vibrant-quinoa-salad.jpg', hint: 'vegan pasta', diet: 'veg' },
  { name: 'Meal Prep', href: '/recipes?q=meal prep', image: '/images/recipes/meal-prep-burrito-bowls.jpg', hint: 'meal prep', diet: 'non-veg' },
  { name: 'Soups', href: '/recipes?q=soup', image: '/images/recipes/creamy-lentil-soup.jpg', hint: 'tortilla soup', diet: 'veg' },
  { name: 'Salads', href: '/recipes?q=salad', image: '/images/recipes/greek-salad-with-grilled-chicken.jpg', hint: 'fresh salad', diet: 'non-veg' },
  { name: 'Breakfast', href: '/recipes?q=breakfast', image: '/images/recipes/fluffy-pancakes.jpg', hint: 'pancakes breakfast', diet: 'veg' },
  { name: 'Lunch', href: '/recipes?q=lunch', image: '/images/recipes/chicken-caesar-wrap.jpg', hint: 'lunch wrap', diet: 'non-veg' },
  { name: 'Desserts', href: '/recipes?q=dessert', image: 'https://placehold.co/112x112.png', hint: 'chocolate cake', diet: 'veg' },
];

const vegMainCategories = [
  { name: 'Quick and Easy', href: '/recipes?q=quick', image: '/images/recipes/caprese-sandwich.jpg', hint: 'quick meal' },
  { name: 'Dinner', href: '/recipes?q=dinner', image: '/images/recipes/creamy-mushroom-risotto.jpg', hint: 'mushroom risotto' },
  { name: 'Most Popular', href: '/recipes?q=pasta', image: '/images/recipes/creamy-tomato-pasta.jpg', hint: 'vegetarian pasta' },
  { name: 'Salads', href: '/recipes?q=salad', image: '/images/recipes/vibrant-quinoa-salad.jpg', hint: 'healthy food' },
];

const nonVegMainCategories = [
  {
    name: 'Quick and Easy',
    href: '/recipes?q=quick',
    image: '/images/recipes/chicken-caesar-wrap.jpg',
    hint: 'chicken rice bowl',
  },
  {
    name: 'Dinner',
    href: '/recipes?q=dinner',
    image: '/images/recipes/classic-beef-lasagna.jpg',
    hint: 'creamy pasta',
  },
  {
    name: 'Most Popular',
    href: '/recipes?q=pasta',
    image: '/images/recipes/creamy-tomato-pasta.jpg',
    hint: 'noodle stirfry',
  },
  {
    name: 'Salads',
    href: '/recipes?q=salad',
    image: '/images/recipes/greek-salad-with-grilled-chicken.jpg',
    hint: 'salad bowl',
  },
];


export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  const router = useRouter();
  const { toast } = useToast();
  const { diet } = useDiet();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Refs for animation targets
  const heroRef = useRef<HTMLElement>(null);
  const subCategoriesRef = useRef<HTMLElement>(null);
  const mainCategoriesRef = useRef<HTMLElement>(null);
  const searchSectionRef = useRef<HTMLElement>(null);
  const communitySectionRef = useRef<HTMLElement>(null);
  
  // State for voice search
  const [isListening, setIsListening] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // State for community recipes
  const [communityRecipes, setCommunityRecipes] = useState<CommunityRecipe[]>([]);

  const fetchCommunityRecipes = useCallback(() => {
    setCommunityRecipes(getCommunityRecipes());
  }, []);

  useEffect(() => {
    fetchCommunityRecipes();
  }, [fetchCommunityRecipes]);

  const filteredRecipes = useMemo(() => {
    if (diet === 'veg') {
        return recipes.filter(r => r.diet === 'veg');
    }
    // In non-veg mode, show only non-veg recipes
    return recipes.filter(r => r.diet === 'non-veg');
  }, [diet]);

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
    return allSubCategories.filter(r => r.diet === 'non-veg');
  }, [diet]);

  const mainCategories = useMemo(() => {
    if (diet === 'veg') {
      return vegMainCategories;
    }
    return nonVegMainCategories;
  }, [diet]);

  const subCategoriesFirstRow = subCategories.slice(0, 6);
  const subCategoriesSecondRow = subCategories.slice(6);

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
    removeCommunityRecipe(recipeId);
    toast({
        title: "Recipe Removed",
        description: `"${recipeTitle}" has been removed from the community kitchen.`
    });
    fetchCommunityRecipes();
  }

  const handleSearch = useCallback((query: string) => {
    if (query.trim().length > 1) {
        setIsSearching(true);
        const queryLower = query.toLowerCase();
        const filteredResults = filteredRecipes.filter(
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
  }, [filteredRecipes]);

  useEffect(() => {
    setHasMounted(true);
    setCommunityRecipes(getCommunityRecipes());

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const refs = [heroRef, subCategoriesRef, mainCategoriesRef, searchSectionRef, communitySectionRef];
    refs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);
  
  useEffect(() => {
    if (!hasMounted) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({
            variant: "destructive",
            title: "Voice Search Error",
            description: "Sorry, I couldn't hear you. Please try again.",
        });
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
    }
  }, [hasMounted, toast]);

  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      
      {/* Hero Carousel Section */}
      <section ref={heroRef} className="mb-16 opacity-0">
        {hasMounted && featuredRecipes.length > 0 ? (
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
          <Skeleton className="h-[450px] w-full rounded-lg" />
        )}
      </section>

      {/* Sub-Categories Section */}
      {subCategories.length > 0 && (
      <section
        ref={subCategoriesRef}
        className="mb-16 opacity-0"
      >
        {hasMounted ? (
          <div className="flex flex-col items-center gap-y-12">
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategoriesFirstRow.map((category) => (
                <Link key={category.name} href={category.href} className="group flex flex-col items-center gap-3 text-center w-28">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover rounded-lg"
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
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategoriesSecondRow.map((category) => (
                <Link key={category.name} href={category.href} className="group flex flex-col items-center gap-3 text-center w-28">
                  <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover rounded-lg"
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
        ) : (
          <div className="flex flex-col items-center gap-y-12">
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategoriesFirstRow.map((category) => (
                <div key={category.name} className="flex flex-col items-center gap-3 text-center w-28">
                  <Skeleton className="h-28 w-28 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategoriesSecondRow.map((category) => (
                <div key={category.name} className="flex flex-col items-center gap-3 text-center w-28">
                  <Skeleton className="h-28 w-28 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      )}

      {/* Main Categories Section */}
      {mainCategories.length > 0 && (
      <section
        ref={mainCategoriesRef}
        className="opacity-0"
      >
        {hasMounted ? (
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
      ref={searchSectionRef}
      className="my-24 opacity-0"
    >
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
                className="w-full h-12 pl-12 pr-24 rounded-lg text-base"
                autoComplete="off"
              />
              {isBrowserSupported && hasMounted && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10",
                    isListening && "text-destructive animate-pulse"
                  )}
                  onClick={handleVoiceSearch}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              )}
            </form>
            {searchQuery.trim().length > 1 && (
              <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
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
                              className="rounded-lg object-cover w-12 h-12"
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

    {/* Community Section */}
    <section ref={communitySectionRef} className="my-24 opacity-0">
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
      
    </div>
  );
}
