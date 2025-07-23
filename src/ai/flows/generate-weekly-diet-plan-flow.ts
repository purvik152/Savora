
'use server';

/**
 * @fileOverview An AI agent that generates a full week's meal plan based on user goals.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { recipes } from '@/lib/recipes';
import { 
    GenerateWeeklyDietPlanInputSchema, 
    WeeklyPlanSchema, 
    type GenerateWeeklyDietPlanInput,
    type WeeklyPlan,
    type Meal
} from './generate-weekly-diet-plan-types';


// This is the exported function you would call from the UI
export async function generateWeeklyDietPlan(input: GenerateWeeklyDietPlanInput): Promise<WeeklyPlan> {
  // In a real implementation, you would call a Genkit flow here with a proper prompt.
  // For now, we will return a mock plan based on existing recipes to demonstrate UI.
  // const plan = await generateWeeklyDietPlanFlow(input);
  const plan = await generateMockMealPlan(input);
  return plan;
}


// Mock function to simulate AI generation using existing recipes
async function generateMockMealPlan(input: GenerateWeeklyDietPlanInput): Promise<WeeklyPlan> {
    const plan: WeeklyPlan = {
      Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {},
      Friday: {}, Saturday: {}, Sunday: {}
    };
    
    const daysOfWeek: (keyof WeeklyPlan)[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    let filteredRecipes = recipes;
    if (input.dietType === 'vegetarian') {
        filteredRecipes = recipes.filter(r => r.diet === 'veg');
    } else if (input.dietType === 'non-vegetarian') {
        filteredRecipes = recipes.filter(r => r.diet === 'non-veg');
    } // 'vegan' would need another filter property on recipes, for now it will behave like vegetarian

    const breakfastRecipes = filteredRecipes.filter(r => r.category === 'Breakfast');
    const lunchRecipes = filteredRecipes.filter(r => r.category === 'Lunch');
    const dinnerRecipes = filteredRecipes.filter(r => r.category === 'Dinner');
    const snackRecipes = filteredRecipes.filter(r => r.category === 'Dessert'); // Using dessert as snacks for now

    const getRandomRecipe = (recipeList: typeof recipes): Meal | undefined => {
        if (recipeList.length === 0) return undefined;
        const r = recipeList[Math.floor(Math.random() * recipeList.length)];
        return {
            title: r.title,
            calories: r.nutrition.calories,
            prepTime: r.prepTime,
            image: r.image,
            imageHint: r.imageHint,
            ingredients: r.ingredients,
            instructions: r.instructions,
        };
    };

    daysOfWeek.forEach(day => {
        if (input.mealsPerDay.includes('Breakfast')) plan[day]!.Breakfast = getRandomRecipe(breakfastRecipes);
        if (input.mealsPerDay.includes('Lunch')) plan[day]!.Lunch = getRandomRecipe(lunchRecipes);
        if (input.mealsPerDay.includes('Dinner')) plan[day]!.Dinner = getRandomRecipe(dinnerRecipes);
        if (input.mealsPerDay.includes('Snacks')) plan[day]!.Snacks = getRandomRecipe(snackRecipes);
    });

    return plan;
}


// The real Genkit flow (currently unused, but ready for a prompt)
const generateWeeklyDietPlanFlow = ai.defineFlow(
  {
    name: 'generateWeeklyDietPlanFlow',
    inputSchema: GenerateWeeklyDietPlanInputSchema,
    outputSchema: WeeklyPlanSchema,
  },
  async (input) => {
    
    const prompt = `Create a 7-day meal plan for a user with the following preferences:
- Diet Type: ${input.dietType}
- Daily Calorie Target: Approximately ${input.dailyCalories} kcal
- Allergens to Avoid: ${input.allergens.join(', ') || 'None'}
- Maximum Cooking Time per Meal: ${input.maxCookingTime ? `${input.maxCookingTime} minutes` : 'Not specified'}
- Primary Goal: ${input.dietGoal}
- Meals to Plan: ${input.mealsPerDay.join(', ')}

For each meal, provide a title, estimated calories, preparation time, a list of ingredients, and step-by-step instructions. Please ensure the total daily calories are close to the user's target.

Return the response in the specified JSON format.
`;
    // This part is commented out to use the mock data instead.
    // To enable real AI generation, you would uncomment this and remove the mock call above.
    /*
    const llmResponse = await generate({
      prompt: prompt,
      model: geminiPro,
      output: { schema: WeeklyPlanSchema },
    });
    
    return llmResponse.output()!;
    */
    
    // For now, we are returning a mock plan.
    return generateMockMealPlan(input);
  }
);
