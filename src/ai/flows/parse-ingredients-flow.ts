'use server';

/**
 * @fileOverview An AI agent that parses recipe ingredients into searchable grocery items.
 *
 * - parseIngredientsForSearch - A function that converts ingredient lists into clean search terms.
 * - ParseIngredientsInput - The input type for the parseIngredientsForSearch function.
 * - ParseIngredientsOutput - The return type for the parseIngredientsForSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ParseIngredientsInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of recipe ingredients with quantities and descriptions.'),
});
export type ParseIngredientsInput = z.infer<typeof ParseIngredientsInputSchema>;

const ParseIngredientsOutputSchema = z.object({
  searchTerms: z.array(z.string()).describe('A list of clean, searchable grocery item names corresponding to the input ingredients.'),
});
export type ParseIngredientsOutput = z.infer<typeof ParseIngredientsOutputSchema>;

export async function parseIngredientsForSearch(input: ParseIngredientsInput): Promise<ParseIngredientsOutput> {
  return parseIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseIngredientsPrompt',
  input: {schema: ParseIngredientsInputSchema},
  output: {schema: ParseIngredientsOutputSchema},
  prompt: `You are an expert grocery shopping assistant. Your task is to convert a list of recipe ingredients into a clean, searchable list of grocery items suitable for an online grocery store like Swiggy Instamart.

**Instructions:**
- For each ingredient in the input list, extract the core product name.
- Remove quantities, units of measurement (like tbsp, cups, oz), and preparation instructions (like 'chopped', 'minced', 'melted', 'sifted').
- Keep important qualifiers that affect the product type (e.g., 'all-purpose flour', 'boneless, skinless chicken breasts', 'ground beef').
- The output must be a JSON object with a 'searchTerms' array, where each element is a clean search term. The number of search terms must match the number of input ingredients.

**Examples:**
- Input: "3 1/2 tbsp olive oil" -> Output: "olive oil"
- Input: "1 (28-ounce) can crushed tomatoes" -> Output: "crushed tomatoes"
- Input: "1/4 cup fresh basil, chopped" -> Output: "fresh basil"
- Input: "1 large egg" -> Output: "egg"

**Ingredient List to Parse:**
{{#each ingredients}}
- {{{this}}}
{{/each}}

Please provide the parsed search terms in the specified JSON format.`,
});

const parseIngredientsFlow = ai.defineFlow(
  {
    name: 'parseIngredientsFlow',
    inputSchema: ParseIngredientsInputSchema,
    outputSchema: ParseIngredientsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
