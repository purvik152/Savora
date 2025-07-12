'use server';

/**
 * @fileOverview An AI agent that generates a 7-day meal plan based on user preferences.
 *
 * - generateMealPlan - A function that handles generating the weekly meal plan.
 * - GenerateMealPlanInput - The input type for the function.
 * - GenerateMealPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RecipeInfoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Dessert']),
  calories: z.string(),
  prepTime: z.string(),
  allergens: z.array(z.string()).optional(),
});

const GenerateMealPlanInputSchema = z.object({
  diet: z.enum(['veg', 'non-veg']).describe("The user's dietary preference."),
  targetCalories: z.number().describe('The user\'s target daily calorie intake.'),
  allergies: z.array(z.string()).describe('A list of allergies to avoid.'),
  maxPrepTime: z.number().describe('The maximum meal preparation time in minutes.'),
  recipes: z.array(RecipeInfoSchema).describe('A list of available recipes to choose from.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const MealSchema = z.object({
  Breakfast: z.string().nullable().describe('The slug of the recipe for breakfast.'),
  Lunch: z.string().nullable().describe('The slug of the recipe for lunch.'),
  Dinner: z.string().nullable().describe('The slug of the recipe for dinner.'),
});

const GenerateMealPlanOutputSchema = z.object({
    Sunday: MealSchema,
    Monday: MealSchema,
    Tuesday: MealSchema,
    Wednesday: MealSchema,
    Thursday: MealSchema,
    Friday: MealSchema,
    Saturday: MealSchema,
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are Savora, an expert AI nutritionist and meal planner. Your task is to create a well-balanced, 7-day meal plan for a user based on their specific needs.

**User Preferences:**
- Diet: {{diet}}
- Target Daily Calories: Approximately {{targetCalories}} kcal
- Allergies to Avoid: {{#if allergies}}{{#each allergies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
- Maximum Preparation Time Per Meal: {{maxPrepTime}} minutes

**Your Constraints:**
1.  **Adhere to Preferences:** Strictly follow the user's diet, allergy, and prep time constraints.
2.  **Calorie Goal:** For each day, select a Breakfast, Lunch, and Dinner whose combined calories come as close as possible to the user's target of {{targetCalories}} kcal.
3.  **Variety:** Do not repeat the same meal more than twice in the entire week. Aim for variety in the meal plan.
4.  **Meal Types:** Assign recipes to the correct meal slot (Breakfast, Lunch, Dinner). Do not assign Dessert recipes.
5.  **Output Format:** You MUST return a full 7-day plan, providing the recipe 'slug' for each meal slot in the specified JSON format. If no suitable recipe is found for a slot, return null for that slot.

**Available Recipes:**
{{#each recipes}}
- Slug: {{{this.slug}}}
  Title: {{{this.title}}}
  Category: {{{this.category}}}
  Calories: {{{this.calories}}}
  Prep Time: {{{this.prepTime}}}
  Allergens: {{#if this.allergens}}{{#each this.allergens}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
{{/each}}

Please generate the complete 7-day meal plan now.`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
