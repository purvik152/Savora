'use server';

/**
 * @fileOverview An AI agent that suggests recipes based on the user's daily physical activity.
 *
 * - getActivityBasedSuggestions - A function that handles generating recipe suggestions.
 * - ActivityBasedSuggestionsInput - The input type for the function.
 * - ActivityBasedSuggestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RecipeInfoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  calories: z.string(),
});

const ActivityBasedSuggestionsInputSchema = z.object({
  activityLevel: z.enum(["low", "moderate", "high"]).describe('The user\'s activity level for the day.'),
  caloriesBurned: z.number().describe('The number of calories the user has burned.'),
  recipes: z.array(RecipeInfoSchema).describe('A list of available recipes to choose from.'),
});
export type ActivityBasedSuggestionsInput = z.infer<typeof ActivityBasedSuggestionsInputSchema>;

const SuggestionSchema = z.object({
  slug: z.string().describe('The slug of the suggested recipe.'),
  reason: z.string().describe('A short, encouraging reason why this recipe fits the activity level.'),
});

const ActivityBasedSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('A list of 2-3 personalized recipe suggestions.'),
});
export type ActivityBasedSuggestionsOutput = z.infer<typeof ActivityBasedSuggestionsOutputSchema>;

export async function getActivityBasedSuggestions(input: ActivityBasedSuggestionsInput): Promise<ActivityBasedSuggestionsOutput> {
  return activityBasedSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'activityBasedSuggestionsPrompt',
  input: {schema: ActivityBasedSuggestionsInputSchema},
  output: {schema: ActivityBasedSuggestionsOutputSchema},
  prompt: `You are Savora, a health-conscious AI chef who helps users refuel their bodies appropriately after physical activity.
A user with a "{{activityLevel}}" activity level, having burned approximately {{caloriesBurned}} calories, is looking for dinner ideas.

From the following list of available recipes, please select 2-3 that would be a perfect fit.

**Suggestion Guidelines:**
- **Low Activity:** Suggest lighter meals, lower in calories and carbs (e.g., salads, soups, lean protein with veggies). The reason should focus on healthy, satisfying options that won't feel heavy.
- **Moderate Activity:** Suggest balanced meals with a good mix of protein for muscle repair and complex carbs for energy replenishment.
- **High Activity:** Suggest more substantial meals, higher in calories and complex carbohydrates to fully replenish energy stores, and high in protein for muscle recovery. The reason should be encouraging, like "You've earned this satisfying meal to refuel!".

For each recipe you suggest, provide a short, encouraging reason.

Only choose from the recipes provided below.

Available Recipes:
{{#each recipes}}
- Slug: {{{this.slug}}}
  Title: {{{this.title}}}
  Description: {{{this.description}}}
  Calories: {{{this.calories}}}
{{/each}}

Please provide your suggestions in the specified JSON format.`,
});

const activityBasedSuggestionsFlow = ai.defineFlow(
  {
    name: 'activityBasedSuggestionsFlow',
    inputSchema: ActivityBasedSuggestionsInputSchema,
    outputSchema: ActivityBasedSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
