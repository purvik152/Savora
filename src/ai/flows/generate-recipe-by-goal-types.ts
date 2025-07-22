/**
 * @fileOverview Types and schemas for the goal-based recipe generator.
 *
 * - GenerateRecipeByGoalInput - The input type for the function.
 * - GenerateRecipeByGoalOutput - The return type for the function.
 * - GenerateRecipeByGoalInputSchema - The Zod schema for the input.
 * - GenerateRecipeByGoalOutputSchema - The Zod schema for the output.
 */

import {z} from 'zod';

export const GenerateRecipeByGoalInputSchema = z.object({
    calories: z.number().describe('The target number of calories for the meal.'),
    macroFocus: z.enum(['High Protein', 'Low Carb', 'Balanced']).describe('The desired macronutrient focus.'),
    allergies: z.array(z.string()).describe('A list of allergies to avoid.'),
    mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']).describe('The type of meal to generate.'),
    time: z.number().describe('The maximum preparation and cooking time in minutes.'),
});
export type GenerateRecipeByGoalInput = z.infer<typeof GenerateRecipeByGoalInputSchema>;

const SingleRecipeSchema = z.object({
    recipeName: z.string().describe('The name of the generated recipe.'),
    description: z.string().describe('A short, enticing description of the recipe.'),
    ingredients: z.array(z.string()).describe('A list of ingredients with quantities.'),
    instructions: z.array(z.string()).describe('The step-by-step cooking instructions.'),
    nutrition: z.object({
        calories: z.string().describe('The estimated total calories (e.g., "710 kcal").'),
        protein: z.string().describe('The estimated grams of protein (e.g., "42g").'),
        carbs: z.string().describe('The estimated grams of carbohydrates (e.g., "48g").'),
        fat: z.string().describe('The estimated grams of fat (e.g., "26g").'),
    }).describe('The estimated nutritional information for the recipe.'),
});

export const GenerateRecipeByGoalOutputSchema = z.object({
    recipes: z.array(SingleRecipeSchema).describe('A list of 3 distinct recipes that match the user\'s goals.'),
});
export type GenerateRecipeByGoalOutput = z.infer<typeof GenerateRecipeByGoalOutputSchema>;

export type SingleRecipe = z.infer<typeof SingleRecipeSchema>;
