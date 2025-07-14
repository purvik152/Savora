
'use server';

/**
 * @fileOverview An AI agent that imports and parses a recipe from a given URL.
 *
 * - importRecipeFromUrl - A function that handles parsing the recipe.
 * - ImportRecipeInput - The input type for the function.
 * - ImportRecipeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ImportRecipeInputSchema = z.object({
  url: z.string().url().describe('The URL of the recipe page to import.'),
});
export type ImportRecipeInput = z.infer<typeof ImportRecipeInputSchema>;

const ImportRecipeOutputSchema = z.object({
  title: z.string().describe("The full title of the recipe."),
  description: z.string().describe("A brief, engaging description of the recipe."),
  prepTime: z.string().describe("The preparation time (e.g., '15 mins'). If not available, estimate it."),
  cookTime: z.string().describe("The cooking time (e.g., '30 mins'). If not available, estimate it."),
  servings: z.string().describe("The number of servings the recipe makes (e.g., '4 people'). If not available, state 'Not specified'."),
  ingredients: z.array(z.string()).describe("The list of ingredients, with each ingredient as a separate string in the array."),
  instructions: z.array(z.string()).describe("The list of step-by-step instructions, with each step as a separate string in the array."),
  diet: z.enum(['veg', 'non-veg']).describe("The dietary classification of the recipe, either 'veg' or 'non-veg'."),
});
export type ImportRecipeOutput = z.infer<typeof ImportRecipeOutputSchema>;


export async function importRecipeFromUrl(input: ImportRecipeInput): Promise<ImportRecipeOutput> {
  return importRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importRecipePrompt',
  input: {schema: ImportRecipeInputSchema},
  output: {schema: ImportRecipeOutputSchema},
  prompt: `You are an expert recipe parsing agent. Your task is to extract recipe details from the content of the provided URL.

You must meticulously extract the following information:
1.  **title**: The main title of the recipe.
2.  **description**: A short summary of the dish.
3.  **prepTime**: The preparation time.
4.  **cookTime**: The cooking time.
5.  **servings**: How many people the recipe serves.
6.  **ingredients**: A list of all ingredients. Each ingredient should be a separate element in an array.
7.  **instructions**: The step-by-step cooking instructions. Each step should be a separate element in an array.
8.  **diet**: Analyze the ingredients to determine if the recipe is 'veg' (vegetarian, containing no meat or fish) or 'non-veg' (contains meat or fish).

**CRITICAL**: If any field (like prep time, cook time, or servings) is not explicitly mentioned on the page, you must make a reasonable estimation based on the recipe's complexity and ingredients. Do not leave fields blank. For servings, if you cannot determine it, output "Not specified".

Please parse the recipe from the following URL and return the data in the specified JSON format.

URL: {{{url}}}
`,
});

const importRecipeFlow = ai.defineFlow(
  {
    name: 'importRecipeFlow',
    inputSchema: ImportRecipeInputSchema,
    outputSchema: ImportRecipeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
