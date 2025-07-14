
'use server';

/**
 * @fileOverview An AI agent that invents a new recipe from a given set of ingredients.
 *
 * - inventRecipe - A function that handles inventing a recipe.
 * - InventRecipeInput - The input type for the inventRecipe function.
 * - InventRecipeOutput - The return type for the inventRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const InventRecipeInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of 3-4 ingredients to be featured in the recipe.'),
});
export type InventRecipeInput = z.infer<typeof InventRecipeInputSchema>;

const InventRecipeOutputSchema = z.object({
  title: z.string().describe('A creative and appealing title for the invented recipe.'),
  description: z.string().describe('A brief, enticing description of the dish.'),
  prepTime: z.string().describe("The estimated preparation time (e.g., '15 mins')."),
  cookTime: z.string().describe("The estimated cooking time (e.g., '30 mins')."),
  servings: z.string().describe("The number of servings the recipe makes (e.g., '4 people')."),
  inventedIngredients: z.array(z.string()).describe("A complete list of ingredients for the recipe. Assume common pantry staples like oil, salt, pepper, and basic spices are available."),
  inventedInstructions: z.array(z.string()).describe("The step-by-step instructions for preparing the dish."),
  imageGenerationPrompt: z.string().describe("A simple, descriptive prompt (e.g. 'professional food photography of a bowl of spicy chicken pasta') for an image generation model to create a photo of the final dish."),
});
export type InventRecipeOutput = z.infer<typeof InventRecipeOutputSchema>;

export async function inventRecipe(input: InventRecipeInput): Promise<InventRecipeOutput> {
  return inventRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventRecipePrompt',
  input: {schema: InventRecipeInputSchema},
  output: {schema: InventRecipeOutputSchema},
  prompt: `You are a world-renowned, innovative chef known for creating unique and delicious recipes from scratch.
You have been challenged to invent a new recipe featuring a specific set of ingredients.

**Featured Ingredients:**
{{#each ingredients}}
- {{{this}}}
{{/each}}

**Your Task:**
1.  **Invent a Recipe:** Create a complete, coherent, and delicious recipe that prominently uses all the featured ingredients.
2.  **Assume Pantry Staples:** You can assume the user has common pantry staples (oil, salt, pepper, basic spices, flour, sugar, etc.) and list them if needed.
3.  **Be Creative:** Give the recipe a unique and appealing title. Write a short, enticing description.
4.  **Provide Details:** Estimate the prep time, cook time, and number of servings.
5.  **Generate Image Prompt:** Write a simple, descriptive prompt for an AI image generator to create a photo of the dish. The prompt should be concise and focus on the visual aspects of the final plated dish. For example: "Professional food photography of a rustic apple and chicken tart."

Please provide the completely new recipe in the specified JSON format.`,
});

const inventRecipeFlow = ai.defineFlow(
  {
    name: 'inventRecipeFlow',
    inputSchema: InventRecipeInputSchema,
    outputSchema: InventRecipeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
