'use server';

/**
 * @fileOverview An AI agent that generates a single recipe based on specific user goals.
 *
 * - generateRecipeByGoal - A function that handles generating the recipe.
 * - GenerateRecipeByGoalInput - The input type for the function.
 * - GenerateRecipeByGoalOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const GenerateRecipeByGoalInputSchema = z.object({
    calories: z.number().describe('The target number of calories for the meal.'),
    macroFocus: z.enum(['High Protein', 'Low Carb', 'Balanced']).describe('The desired macronutrient focus.'),
    allergies: z.array(z.string()).describe('A list of allergies to avoid.'),
    mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']).describe('The type of meal to generate.'),
    time: z.number().describe('The maximum preparation and cooking time in minutes.'),
});
export type GenerateRecipeByGoalInput = z.infer<typeof GenerateRecipeByGoalInputSchema>;

export const GenerateRecipeByGoalOutputSchema = z.object({
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
export type GenerateRecipeByGoalOutput = z.infer<typeof GenerateRecipeByGoalOutputSchema>;


export async function generateRecipeByGoal(input: GenerateRecipeByGoalInput): Promise<GenerateRecipeByGoalOutput> {
  return generateRecipeByGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeByGoalPrompt',
  input: {schema: GenerateRecipeByGoalInputSchema},
  output: {schema: GenerateRecipeByGoalOutputSchema},
  prompt: `You are an expert chef and nutritionist.
Your task is to generate a single, complete recipe that perfectly matches the user's specific health and time goals.

**User's Goals:**
- Meal Type: {{mealType}}
- Target Calories: Approximately {{calories}} kcal
- Macro Focus: {{macroFocus}}
- Time Limit: Under {{time}} minutes (total prep and cook time)
- Allergies to Avoid: {{#if allergies}}{{#each allergies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

**Recipe Requirements:**
1.  **Invent a Recipe:** Create a new, appealing, and delicious recipe that fits all the above criteria.
2.  **Detailed Instructions:** Provide clear, step-by-step instructions that are easy to follow.
3.  **Ingredient List:** List all necessary ingredients with precise quantities.
4.  **Nutrition Estimates:** Provide a realistic estimate for the calories, protein, carbohydrates, and fat, formatted as strings (e.g., "710 kcal", "42g").
5.  **Format:** Return the entire response in the specified JSON format.

Please generate the recipe now.`,
});

const generateRecipeByGoalFlow = ai.defineFlow(
  {
    name: 'generateRecipeByGoalFlow',
    inputSchema: GenerateRecipeByGoalInputSchema,
    outputSchema: GenerateRecipeByGoalOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
