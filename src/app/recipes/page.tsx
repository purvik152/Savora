
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Flame, CheckCircle } from "lucide-react";

const recipe = {
  title: "Ultimate Creamy Tomato Pasta",
  description: "A rich and decadent creamy tomato pasta that comes together in under 30 minutes. Perfect for a busy weeknight, but special enough for a date night in.",
  image: "https://images.unsplash.com/photo-1598866594240-a3b5a9502056?q=80&w=800&h=600&fit=crop",
  prepTime: "10 mins",
  cookTime: "20 mins",
  servings: "4 people",
  ingredients: [
    "1 lb (450g) rigatoni or your favorite pasta",
    "2 tbsp olive oil",
    "1 medium yellow onion, finely chopped",
    "4 cloves garlic, minced",
    "1 (28-ounce) can crushed tomatoes",
    "1/2 cup heavy cream",
    "1/2 cup grated Parmesan cheese, plus more for serving",
    "1 tsp dried oregano",
    "1/2 tsp red pepper flakes (optional)",
    "Salt and freshly ground black pepper to taste",
    "1/4 cup fresh basil leaves, chopped",
  ],
  instructions: [
    "Cook the pasta according to package directions until al dente. Reserve 1 cup of pasta water before draining.",
    "While the pasta is cooking, heat the olive oil in a large skillet or Dutch oven over medium heat. Add the chopped onion and cook until softened, about 5-7 minutes.",
    "Add the minced garlic and red pepper flakes (if using) and cook for another minute until fragrant.",
    "Pour in the crushed tomatoes, oregano, a generous pinch of salt, and pepper. Bring to a simmer and let it cook for about 10 minutes, stirring occasionally.",
    "Reduce the heat to low and stir in the heavy cream and Parmesan cheese until the cheese is melted and the sauce is creamy.",
    "Add the drained pasta to the skillet with the sauce. Toss to combine, adding a splash of the reserved pasta water if the sauce is too thick.",
    "Stir in the fresh basil. Taste and adjust seasoning with more salt and pepper if needed.",
    "Serve immediately, topped with extra Parmesan cheese and fresh basil.",
  ],
  nutrition: {
    calories: "650 kcal",
    protein: "25g",
    carbohydrates: "80g",
    fat: "28g",
  },
};

export default function RecipePage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="p-0 relative h-64 md:h-96">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              data-ai-hint="creamy pasta"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <Badge variant="secondary" className="mb-2">Dinner</Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{recipe.title}</h1>
              <p className="mt-2 text-lg text-white/90 max-w-2xl drop-shadow-md">{recipe.description}</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-center">
                  <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <span className="font-bold">Prep Time</span>
                    <span className="text-muted-foreground">{recipe.prepTime}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                    <Flame className="h-8 w-8 text-primary mb-2" />
                    <span className="font-bold">Cook Time</span>
                    <span className="text-muted-foreground">{recipe.cookTime}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-lg">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <span className="font-bold">Servings</span>
                    <span className="text-muted-foreground">{recipe.servings}</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">Instructions</h2>
                  <ol className="space-y-6">
                    {recipe.instructions.map((step, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mt-1">{index + 1}</div>
                        <p className="flex-1 text-base text-foreground/90">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div>
                <div className="sticky top-24">
                  <Card className="bg-secondary/30">
                    <CardHeader>
                      <CardTitle>Ingredients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6 bg-secondary/30">
                    <CardHeader>
                        <CardTitle>Nutrition Facts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <p><strong>Calories:</strong> {recipe.nutrition.calories}</p>
                           <p><strong>Protein:</strong> {recipe.nutrition.protein}</p>
                           <p><strong>Carbs:</strong> {recipe.nutrition.carbohydrates}</p>
                           <p><strong>Fat:</strong> {recipe.nutrition.fat}</p>
                        </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
