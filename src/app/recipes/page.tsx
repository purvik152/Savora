
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recipes, Recipe } from "@/lib/recipes";
import { Utensils, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
  <Link href={`/recipes/${recipe.slug}`} className="block h-full">
    <Card className="h-full flex flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2">
      <div className="relative w-full h-48">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          data-ai-hint={recipe.imageHint}
        />
      </div>
      <CardContent className="p-6 flex flex-col flex-grow">
        <CardTitle className="text-xl font-semibold mb-2 line-clamp-2">{recipe.title}</CardTitle>
        <p className="text-muted-foreground line-clamp-3 flex-grow">{recipe.description}</p>
      </CardContent>
    </Card>
  </Link>
);

export default function RecipesPage() {
  const cuisines = [...new Set(recipes.map((r) => r.cuisine))];
  const breakfastRecipes = recipes.filter(r => r.category === 'Breakfast');
  const lunchRecipes = recipes.filter(r => r.category === 'Lunch');
  const dinnerRecipes = recipes.filter(r => r.category === 'Dinner');

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Our Recipes</h1>
        <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">From quick bites to family feasts, find your next favorite meal here.</p>
      </div>

      <section id="cuisines" className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Explore by Cuisine</h2>
        {cuisines.map((cuisine) => {
          const cuisineRecipes = recipes
            .filter((r) => r.cuisine === cuisine)
            .slice(0, 3);
          if (cuisineRecipes.length === 0) return null;

          return (
            <div key={cuisine} className="mb-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MapPin className="text-primary h-6 w-6" /> {cuisine}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {cuisineRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <Separator className="my-16" />

      <section id="meal-types">
         <h2 className="text-3xl font-bold mb-8 text-center">Or Browse by Meal Type</h2>
        <Tabs defaultValue="breakfast" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="breakfast">
               Breakfast
            </TabsTrigger>
            <TabsTrigger value="lunch">
               Lunch
            </TabsTrigger>
            <TabsTrigger value="dinner">
               Dinner
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="breakfast">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {breakfastRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </TabsContent>
          
          <TabsContent value="lunch">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {lunchRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </TabsContent>

          <TabsContent value="dinner">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dinnerRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
