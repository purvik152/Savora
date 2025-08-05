
'use server';

/**
 * @fileOverview An AI agent that suggests recipes based on ingredients a user has.
 *
 * - getSuggestionsByIngredients - A function that handles generating recipe suggestions.
 * - SuggestByIngredientsInput - The input type for the function.
 * - SuggestByIngredientsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RecipeInfoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
});

const SuggestByIngredientsInputSchema = z.object({
  ingredients: z.array(z.string()).describe("The list of ingredients the user has on hand."),
  recipes: z.array(RecipeInfoSchema).describe('A list of available recipes to choose from.'),
});
export type SuggestByIngredientsInput = z.infer<typeof SuggestByIngredientsInputSchema>;

const SuggestionSchema = z.object({
  slug: z.string().describe('The slug of the suggested recipe.'),
  reason: z.string().describe('A short, helpful reason why this recipe is a good match for the provided ingredients.'),
});

const SuggestByIngredientsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('A list of 3-4 personalized recipe suggestions based on ingredients.'),
});
export type SuggestByIngredientsOutput = z.infer<typeof SuggestByIngredientsOutputSchema>;

export async function getSuggestionsByIngredients(input: SuggestByIngredientsInput): Promise<SuggestByIngredientsOutput> {
  return suggestByIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestByIngredientsPrompt',
  input: {schema: SuggestByIngredientsInputSchema},
  output: {schema: SuggestByIngredientsOutputSchema},
  prompt: `You are Savvy, a clever AI recipe finder. A user wants to cook something with the ingredients they have available.

Your task is to analyze the user's ingredients and suggest 3-4 recipes from the provided list that are the best match.

**User's Ingredients:**
{{#each ingredients}}
- {{{this}}}
{{/each}}

**Prioritization Rules:**
1.  **Direct Matches:** Prioritize recipes that use the most ingredients from the user's list.
2.  **Pantry Staples:** It's okay if a recipe requires a few common pantry staples that the user didn't list (e.g., oil, salt, pepper, flour, sugar).
3.  **Missing Ingredients:** For each suggestion, briefly mention any main ingredients the user might be missing.

For each recipe you suggest, provide a short, helpful reason why it's a good choice.

**Example Reason:** "This is a great match because you have the chicken and pasta. You'll just need some heavy cream."

Only choose from the recipes provided below.

**Available Recipes (with their required ingredients):**
{{#each recipes}}
- Slug: {{{this.slug}}}
  Title: {{{this.title}}}
  Ingredients:
  {{#each this.ingredients}}
  - {{{this}}}
  {{/each}}
{{/each}}

Please provide your suggestions in the specified JSON format.`,
});

const suggestByIngredientsFlow = ai.defineFlow(
  {
    name: 'suggestByIngredientsFlow',
    inputSchema: SuggestByIngredientsInputSchema,
    outputSchema: SuggestByIngredientsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
