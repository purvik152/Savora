'use server';

/**
 * @fileOverview An AI agent that suggests recipes based on the user's mood.
 *
 * - getMoodBasedSuggestions - A function that handles generating recipe suggestions.
 * - MoodBasedSuggestionsInput - The input type for the function.
 * - MoodBasedSuggestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RecipeInfoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
});

const MoodBasedSuggestionsInputSchema = z.object({
  mood: z.string().describe('The user\'s current mood (e.g., "Sad", "Energetic").'),
  diet: z.string().describe('The user\'s dietary preference (e.g., "veg", "non-veg").'),
  recipes: z.array(RecipeInfoSchema).describe('A list of available recipes to choose from.'),
});
export type MoodBasedSuggestionsInput = z.infer<typeof MoodBasedSuggestionsInputSchema>;

const SuggestionSchema = z.object({
  slug: z.string().describe('The slug of the suggested recipe.'),
  reason: z.string().describe('A short, empathetic reason why this recipe fits the mood.'),
});

const MoodBasedSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('A list of 3-4 personalized recipe suggestions.'),
});
export type MoodBasedSuggestionsOutput = z.infer<typeof MoodBasedSuggestionsOutputSchema>;

export async function getMoodBasedSuggestions(input: MoodBasedSuggestionsInput): Promise<MoodBasedSuggestionsOutput> {
  return moodBasedSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodBasedSuggestionsPrompt',
  input: {schema: MoodBasedSuggestionsInputSchema},
  output: {schema: MoodBasedSuggestionsOutputSchema},
  prompt: `You are Savvy, an insightful and empathetic AI chef who understands the deep connection between food and emotions.
A user who is feeling "{{mood}}" is looking for recipe ideas. Their dietary preference is "{{diet}}".

From the following list of available recipes, please select 3 to 4 that would be a perfect fit for their current mood.

For each recipe you suggest, provide a short, kind, and thoughtful reason why it's a good choice. For example:
- If they are sad, suggest comforting and easy-to-make food.
- If they are energetic, suggest something light, fresh, and quick.
- If they are feeling romantic, suggest something elegant or shareable.
- If they are stressed, suggest something that is nourishing and not too complicated.

Only choose from the recipes provided below.

Available Recipes:
{{#each recipes}}
- Slug: {{{this.slug}}}
  Title: {{{this.title}}}
  Description: {{{this.description}}}
{{/each}}

Please provide your suggestions in the specified JSON format.`,
});

const moodBasedSuggestionsFlow = ai.defineFlow(
  {
    name: 'moodBasedSuggestionsFlow',
    inputSchema: MoodBasedSuggestionsInputSchema,
    outputSchema: MoodBasedSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
