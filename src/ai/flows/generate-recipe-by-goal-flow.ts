'use server';

/**
 * @fileOverview An AI agent that generates a multiple recipes based on specific user goals.
 *
 * - generateRecipeByGoal - A function that handles generating the recipe.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateRecipeByGoalInput,
    GenerateRecipeByGoalInputSchema,
    GenerateRecipeByGoalOutput,
    GenerateRecipeByGoalOutputSchema
} from './generate-recipe-by-goal-types';

export async function generateRecipeByGoal(input: GenerateRecipeByGoalInput): Promise<GenerateRecipeByGoalOutput> {
  return generateRecipeByGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeByGoalPrompt',
  input: {schema: GenerateRecipeByGoalInputSchema},
  output: {schema: GenerateRecipeByGoalOutputSchema},
  prompt: `You are an expert chef and nutritionist.
Your task is to generate **3 distinct recipe ideas** that perfectly match the user's specific health and time goals.

**User's Goals:**
- Meal Type: {{mealType}}
- Target Calories: Approximately {{calories}} kcal
- Macro Focus: {{macroFocus}}
- Time Limit: Under {{time}} minutes (total prep and cook time)
- Allergies to Avoid: {{#if allergies}}{{#each allergies}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

**Recipe Requirements:**
1.  **Invent Recipes:** Create three new, appealing, and delicious recipes that fit all the above criteria. They should be different from each other.
2.  **Detailed Instructions:** For each recipe, provide clear, step-by-step instructions that are easy to follow.
3.  **Ingredient List:** For each recipe, list all necessary ingredients with precise quantities.
4.  **Nutrition Estimates:** For each recipe, provide a realistic estimate for the calories, protein, carbohydrates, and fat, formatted as strings (e.g., "710 kcal", "42g").
5.  **Format:** Return the entire response in the specified JSON format, with all three recipes in the 'recipes' array.

Please generate the recipes now.`,
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
