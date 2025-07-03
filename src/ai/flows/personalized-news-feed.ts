'use server';

/**
 * @fileOverview An AI agent that provides personalized food and health news suggestions based on user preferences.
 *
 * - generatePersonalizedNewsFeed - A function that generates personalized news suggestions.
 * - PersonalizedNewsFeedInput - The input type for the generatePersonalizedNewsFeed function.
 * - PersonalizedNewsFeedOutput - The return type for the generatePersonalizedNewsFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedNewsFeedInputSchema = z.object({
  userSearchHistory: z
    .array(z.string())
    .describe('The user past recipe searches.'),
  userPreferences: z
    .string()
    .describe('Additional user preferences, such as dietary restrictions or cuisine preferences.'),
});

export type PersonalizedNewsFeedInput = z.infer<typeof PersonalizedNewsFeedInputSchema>;

const PersonalizedNewsFeedOutputSchema = z.object({
  newsSuggestions: z.array(z.string()).describe('A list of personalized news suggestions.'),
});

export type PersonalizedNewsFeedOutput = z.infer<typeof PersonalizedNewsFeedOutputSchema>;

export async function generatePersonalizedNewsFeed(input: PersonalizedNewsFeedInput): Promise<PersonalizedNewsFeedOutput> {
  return personalizedNewsFeedFlow(input);
}

const getNewsSuggestions = ai.defineTool({
  name: 'getNewsSuggestions',
  description: 'Retrieves the latest food and health news based on a query.',
  inputSchema: z.object({
    query: z.string().describe('The query to use when searching for news.'),
  }),
  outputSchema: z.array(z.string()),
},
async (input) => {
  // TODO: Implement the logic to fetch news suggestions from a news API based on the query.
  // Replace this with actual API call and data processing.
  console.log(`Tool called with query: ${input.query}`);
  return [`Mock News 1 about ${input.query}`, `Mock News 2 about ${input.query}`];
});

const prompt = ai.definePrompt({
  name: 'personalizedNewsFeedPrompt',
  input: {
    schema: PersonalizedNewsFeedInputSchema,
  },
  output: {
    schema: PersonalizedNewsFeedOutputSchema,
  },
  tools: [getNewsSuggestions],
  system: `You are a personalized news curator. Analyze the user's past recipe searches and preferences to determine relevant food and health news. Use the getNewsSuggestions tool to fetch news articles.  The news articles should match the users past search history and any provided user preferences.  For example, if a user frequently searches for 'keto recipes' and has a preference for 'low-carb diets', prioritize news related to ketogenic diets and low-carb health benefits.`,
  prompt: `User Search History: {{{userSearchHistory}}}
User Preferences: {{{userPreferences}}}

Based on this information, what news suggestions do you have for the user?`, // Removed the Handlebars {{await}} which is invalid.
});

const personalizedNewsFeedFlow = ai.defineFlow(
  {
    name: 'personalizedNewsFeedFlow',
    inputSchema: PersonalizedNewsFeedInputSchema,
    outputSchema: PersonalizedNewsFeedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
