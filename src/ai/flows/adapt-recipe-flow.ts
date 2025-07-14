
'use server';

/**
 * @fileOverview An AI agent that adapts a recipe based on a user's request.
 *
 * - adaptRecipe - A function that handles remixing a recipe.
 * - AdaptRecipeInput - The input type for the adaptRecipe function.
 * - AdaptRecipeOutput - The return type for the adaptRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AdaptRecipeInputSchema = z.object({
  request: z.string().describe("The user's request for how to adapt the recipe (e.g., 'make it vegan', 'add a spicy kick')."),
  originalTitle: z.string().describe('The original recipe title.'),
  originalIngredients: z.array(z.string()).describe('The original list of ingredients.'),
  originalInstructions: z.array(z.string()).describe('The original list of instructions.'),
});
export type AdaptRecipeInput = z.infer<typeof AdaptRecipeInputSchema>;

const AdaptRecipeOutputSchema = z.object({
  adaptedTitle: z.string().describe('A new title for the adapted recipe.'),
  adaptedIngredients: z.array(z.string()).describe('The new list of ingredients for the adapted recipe.'),
  adaptedInstructions: z.array(z.string()).describe('The new list of instructions for the adapted recipe.'),
  adaptationSummary: z.string().describe('A brief summary of the changes made.'),
});
export type AdaptRecipeOutput = z.infer<typeof AdaptRecipeOutputSchema>;

export async function adaptRecipe(input: AdaptRecipeInput): Promise<AdaptRecipeOutput> {
  return adaptRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptRecipePrompt',
  input: {schema: AdaptRecipeInputSchema},
  output: {schema: AdaptRecipeOutputSchema},
  prompt: `You are a creative and expert recipe developer. A user wants to "remix" an existing recipe.
Your task is to adapt the original recipe based on their specific request.

**User's Request:** "{{request}}"

**Original Recipe:**
Title: {{originalTitle}}

Ingredients:
{{#each originalIngredients}}
- {{{this}}}
{{/each}}

Instructions:
{{#each originalInstructions}}
{{@index}}. {{{this}}}
{{/each}}

**Your Task:**
1.  **Rewrite the Recipe:** Modify the ingredients and instructions to meet the user's request.
    - If they say "make it vegan," replace meat/dairy with appropriate vegan substitutes.
    - If they say "make it spicier," add ingredients like chili flakes, jalapeños, or cayenne pepper and adjust instructions accordingly.
    - Be creative but ensure the recipe remains coherent and delicious.
2.  **Create a New Title:** Come up with a new, creative title that reflects the change (e.g., "Spicy Kick" Creamy Tomato Pasta, "Vegan-Style" Lemon Herb Chicken).
3.  **Summarize Your Changes:** Write a brief, one-sentence summary of what you changed (e.g., "I replaced the chicken with firm tofu and used coconut cream instead of heavy cream to make it vegan.").
4.  **Maintain Structure:** Keep the number of ingredients and instructions roughly the same.

Please provide the fully adapted recipe in the specified JSON format.`,
});

const adaptRecipeFlow = ai.defineFlow(
  {
    name: 'adaptRecipeFlow',
    inputSchema: AdaptRecipeInputSchema,
    outputSchema: AdaptRecipeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
