

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
import { WhatsInYourKitchen } from '@/components/home/WhatsInYourKitchen';


const allFeaturedRecipes = [
  {
    name: 'Paella Valenciana',
    image: '/images/recipes/paella-valenciana.jpg',
    hint: 'paella pan',
    description: 'The authentic Spanish paella with chicken and rabbit, cooked to create the perfect "socarrat".',
    href: '/recipes/paella-valenciana',
    diet: 'non-veg'
  },
  {
    name: 'Mushroom & Spinach Quesadillas',
    image: '/images/recipes/mushroom-and-spinach-quesadillas.jpg',
    hint: 'quesadillas lunch',
    description: 'Cheesy, savory quesadillas filled with sautéed mushrooms, garlic, and spinach. A perfect quick meal.',
    href: '/recipes/mushroom-spinach-quesadillas',
    diet: 'veg'
  },
  {
    name: 'Authentic Pad Thai',
    image: '/images/recipes/pad-thai-recipe.jpg',
    hint: 'pad thai noodles',
    description: 'A classic Thai noodle stir-fry with a perfect balance of sweet, sour, and savory flavors.',
    href: '/recipes/pad-thai-recipe',
    diet: 'non-veg'
  },
  {
    name: 'Vibrant Quinoa Salad',
    image: '/images/recipes/vibrant-quinoa-salad.jpg',
    hint: 'quinoa salad',
    description: 'A colorful and nutrient-packed quinoa salad with a zesty lemon vinaigrette.',
    href: '/recipes/vibrant-quinoa-salad',
    diet: 'veg'
  },
  {
    name: 'Lamb Rogan Josh',
    image: '/images/recipes/lamb-rogan-josh.jpg',
    hint: 'lamb curry',
    description: 'A fragrant and robust lamb curry from Kashmir with a brilliant red color and aromatic spices.',
    href: '/recipes/lamb-rogan-josh',
    diet: 'non-veg'
  },
  {
    name: 'Hearty Lentil Shepherd\'s Pie',
    image: '/images/recipes/lentil-shepherds-pie.jpg',
    hint: 'shepherds pie',
    description: 'A comforting and savory vegetarian shepherd\'s pie with a rich lentil filling.',
    href: '/recipes/lentil-shepherds-pie',
    diet: 'veg'
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

  // State for voice search
  const [isListening, setIsListening] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

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
    return allSubCategories.filter(r => r.diet === 'non-veg' || r.diet === 'veg'); // Show all for variety
  }, [diet]);

  const mainCategories = useMemo(() => {
    if (diet === 'veg') {
      return vegMainCategories;
    }
    return nonVegMainCategories;
  }, [diet]);

  const subCategoriesFirstRow = subCategories.slice(0, Math.ceil(subCategories.length / 2));
  const subCategoriesSecondRow = subCategories.slice(Math.ceil(subCategories.length / 2));

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
          <div className="flex flex-col items-center gap-y-12">
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategoriesFirstRow.map((category, i) => (
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
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategoriesSecondRow.map((category, i) => (
                <Link key={category.name} href={category.href} className="group flex flex-col items-center gap-3 text-center w-36 animate-fade-in-up" style={{ animationDelay: `${(i + subCategoriesFirstRow.length) * 100}ms` }}>
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
          </div>
        ) : (
          <div className="flex flex-col items-center gap-y-12">
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategoriesFirstRow.map((category) => (
                <div key={category.name} className="flex flex-col items-center gap-3 text-center w-36">
                  <Skeleton className="h-36 w-36 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-12 md:gap-x-12 lg:gap-x-16">
              {subCategoriesSecondRow.map((category) => (
                <div key={category.name} className="flex flex-col items-center gap-3 text-center w-36">
                  <Skeleton className="h-36 w-36 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-md" />
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
      
    </div>
  );
}
