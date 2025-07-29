
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
import { getNewsFromAPI, NewsArticleSchema } from '@/lib/news-api';
export type { NewsArticle } from '@/lib/news-api';


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
  newsSuggestions: z.array(NewsArticleSchema).describe('A list of personalized news suggestions with titles and URLs.'),
});

export type PersonalizedNewsFeedOutput = z.infer<typeof PersonalizedNewsFeedOutputSchema>;

export async function generatePersonalizedNewsFeed(input: PersonalizedNewsFeedInput): Promise<PersonalizedNewsFeedOutput> {
  return personalizedNewsFeedFlow(input);
}

const personalizedNewsFeedFlow = ai.defineFlow(
  {
    name: 'personalizedNewsFeedFlow',
    inputSchema: PersonalizedNewsFeedInputSchema,
    outputSchema: PersonalizedNewsFeedOutputSchema,
  },
  async input => {
    // Combine user inputs into a single search query
    const query = [...input.userSearchHistory, input.userPreferences].join(' ');
    
    // Directly call the NewsAPI function instead of an LLM
    const articles = await getNewsFromAPI({ query: query || 'food health' });

    return { newsSuggestions: articles };
  }
);
