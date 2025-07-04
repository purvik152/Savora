
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recipes, Recipe } from "@/lib/recipes";
import { Utensils } from "lucide-react";

const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
  <Link href={`/recipes/${recipe.slug}`} className="block h-full">
    <Card className="h-full flex flex-col overflow-hidden transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2">
      <CardHeader className="p-0">
        <Image
          src={recipe.image}
          alt={recipe.title}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
          data-ai-hint={recipe.imageHint}
        />
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-grow">
        <CardTitle className="text-xl font-semibold mb-2 line-clamp-2">{recipe.title}</CardTitle>
        <p className="text-muted-foreground line-clamp-3 flex-grow">{recipe.description}</p>
      </CardContent>
    </Card>
  </Link>
);

export default function RecipesPage() {
  const breakfastRecipes = recipes.filter(r => r.category === 'Breakfast');
  const lunchRecipes = recipes.filter(r => r.category === 'Lunch');
  const dinnerRecipes = recipes.filter(r => r.category === 'Dinner');

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore Our Recipes</h1>
        <p className="max-w-2xl mx-auto mt-4 text-muted-foreground">From quick bites to family feasts, find your next favorite meal here.</p>
      </div>

      <section id="breakfast" className="mb-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Utensils className="text-primary" /> Breakfast</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {breakfastRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      </section>

      <section id="lunch" className="mb-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Utensils className="text-primary" /> Lunch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {lunchRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      </section>
      
      <section id="dinner">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3"><Utensils className="text-primary" /> Dinner</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {dinnerRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      </section>
    </div>
  );
}
