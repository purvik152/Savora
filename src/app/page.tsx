import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Newspaper, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const recipeCategories = [
  { name: 'Breakfast', image: 'https://placehold.co/400x300.png', hint: 'pancakes breakfast', description: "Start your day with a delicious and energizing meal." },
  { name: 'Lunch', image: 'https://placehold.co/400x300.png', hint: 'salad lunch', description: "Quick and satisfying recipes to power through your afternoon." },
  { name: 'Dinner', image: 'https://placehold.co/400x300.png', hint: 'roast chicken', description: "Hearty and flavorful dishes to end your day perfectly." },
  { name: 'Desserts', image: 'https://placehold.co/400x300.png', hint: 'chocolate cake', description: "Indulge your sweet tooth with our decadent treats." },
  { name: 'Healthy Snacks', image: 'https://placehold.co/400x300.png', hint: 'healthy snacks', description: "Nutritious and tasty bites for any time of day." },
  { name: 'Diet Plans', image: 'https://placehold.co/400x300.png', hint: 'diet meal', description: "Curated meal plans to help you achieve your health goals." },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
            Discover Your Next Favorite Meal
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in-up animation-delay-300">
            Savora brings the world's kitchens to you. Explore thousands of recipes, get step-by-step guidance, and stay updated with the latest food news.
          </p>
          <div className="animate-fade-in-up animation-delay-600">
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-transform transform hover:scale-105">
              <Link href="/#categories">Explore Recipes</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="categories" className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A World of Flavors Awaits</h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">From quick breakfasts to elaborate dinners, find the perfect recipe for any occasion.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipeCategories.map((category, index) => (
              <Card key={category.name} className="overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
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
            <div className="space-y-4">
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
            <div>
              <Image src="https://placehold.co/600x400.png" alt="News Feed" data-ai-hint="food news" width={600} height={400} className="rounded-xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
