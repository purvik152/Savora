import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const recipeCategories = [
  {
    name: "Breakfast",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=400&h=300&fit=crop",
    description: "Start your day with a delicious and energizing meal.",
    hint: "pancakes breakfast"
  },
  {
    name: "Lunch",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=300&fit=crop",
    description: "Quick and satisfying recipes to power through your afternoon.",
    hint: "salad lunch"
  },
  {
    name: "Dinner",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&h=300&fit=crop",
    description: "Hearty and flavorful dishes to end your day perfectly.",
    hint: "salmon dinner"
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative w-full py-20 md:py-32 lg:py-40 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920&fit=crop"
            alt="A beautiful spread of food"
            fill
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint="food spread"
            className="animate-zoom-in"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-12 duration-700 ease-out text-white drop-shadow-lg dark:text-white">
            Discover Your Next Favorite Meal
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 mb-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200 ease-out fill-mode-forwards drop-shadow-md dark:text-white/90">
            Savora brings the world's kitchens to you. Explore thousands of recipes, get step-by-step guidance, and stay updated with the latest food news.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400 ease-out fill-mode-forwards">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 transition-transform transform hover:scale-105 shadow-lg">
              <Link href="/#recipes">Explore Recipes</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="recipes" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12 animate-in fade-in-0 slide-in-from-bottom-12 duration-700 ease-out">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A World of Flavors Awaits</h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">From quick breakfasts to elaborate dinners, find the perfect recipe for any occasion.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipeCategories.map((category, index) => (
              <Card 
                key={category.name} 
                className="overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 animate-in fade-in zoom-in-95 fill-mode-forwards"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <CardHeader className="p-0">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                    data-ai-hint={category.hint}
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-2xl font-semibold mb-2">{category.name}</CardTitle>
                  <p className="text-muted-foreground">{category.description}</p>
                   <Button variant="link" className="p-0 mt-4 text-primary" asChild>
                    <Link href="#">View Recipes &rarr;</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-left-12 duration-700 ease-out">
              <div className="inline-block rounded-lg bg-primary text-primary-foreground px-3 py-1 text-sm">New Feature</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Personalized Food News</h2>
              <p className="text-muted-foreground text-lg">
                Get the latest scoop on food trends, health tips, and nutritional advice, all tailored to your tastes and search history. Our AI-powered news feed keeps you informed and inspired.
              </p>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform transform hover:scale-105">
                <Link href="/news">
                  <Newspaper className="mr-2 h-5 w-5" />
                  Get My News Feed
                </Link>
              </Button>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-right-12 duration-700 ease-out">
              <Image src="https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=600&h=400&fit=crop" alt="News Feed" width={600} height={400} className="rounded-xl shadow-2xl" data-ai-hint="food news" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
