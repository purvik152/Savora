'use server';

/**
 * @fileOverview An AI agent that translates recipe content into different languages.
 *
 * - translateRecipe - A function that handles the translation of recipe ingredients and instructions.
 * - TranslateRecipeInput - The input type for the translateRecipe function.
 * - TranslateRecipeOutput - The return type for the translateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const TranslateRecipeInputSchema = z.object({
  ingredients: z.array(z.string()).describe('The list of ingredients to translate.'),
  instructions: z.array(z.string()).describe('The list of instructions to translate.'),
  targetLanguage: z.string().describe('The language to translate the content into (e.g., "Spanish", "French").'),
});
export type TranslateRecipeInput = z.infer<typeof TranslateRecipeInputSchema>;

const TranslateRecipeOutputSchema = z.object({
  translatedIngredients: z.array(z.string()).describe('The translated list of ingredients.'),
  translatedInstructions: z.array(z.string()).describe('The translated list of instructions.'),
});
export type TranslateRecipeOutput = z.infer<typeof TranslateRecipeOutputSchema>;

export async function translateRecipe(input: TranslateRecipeInput): Promise<TranslateRecipeOutput> {
  return translateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateRecipePrompt',
  input: {schema: TranslateRecipeInputSchema},
  output: {schema: TranslateRecipeOutputSchema},
  prompt: `You are a professional translator specializing in culinary content. Your task is to translate a recipe into the specified target language.

**Target Language:** {{targetLanguage}}

**Instructions:**
- Translate each ingredient and each instruction accurately.
- Maintain the original structure and number of items in both the ingredients and instructions arrays.
- Preserve culinary measurements and terms where appropriate (e.g., "1 cup", "1/4 tsp", "preheat oven").
- Ensure the output is provided in the exact JSON format specified.

**Original Ingredients:**
{{#each ingredients}}
- {{{this}}}
{{/each}}

**Original Instructions:**
{{#each instructions}}
{{@index}}. {{{this}}}
{{/each}}

Please provide the translated recipe in {{targetLanguage}}.`,
});

const translateRecipeFlow = ai.defineFlow(
  {
    name: 'translateRecipeFlow',
    inputSchema: TranslateRecipeInputSchema,
    outputSchema: TranslateRecipeOutputSchema,
  },
  async (input) => {
    // If the target language is English, no need to call the AI.
    if (input.targetLanguage.toLowerCase() === 'english') {
      return {
        translatedIngredients: input.ingredients,
        translatedInstructions: input.instructions,
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
