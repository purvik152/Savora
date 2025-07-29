
'use server';

/**
 * @fileOverview An AI agent that fetches the latest general food and health news.
 *
 * - getLatestFoodNews - A function that returns a list of recent news articles.
 * - LatestFoodNewsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getNewsFromAPI, NewsArticleSchema } from '@/lib/news-api';
export type { NewsArticle } from '@/lib/news-api';

const LatestFoodNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema).describe('A list of the latest food and health news articles.'),
});
export type LatestFoodNewsOutput = z.infer<typeof LatestFoodNewsOutputSchema>;


export async function getLatestFoodNews(): Promise<LatestFoodNewsOutput> {
  // Correctly invoke the flow by running it without any input.
  return latestFoodNewsFlow();
}

const latestFoodNewsFlow = ai.defineFlow(
  {
    name: 'latestFoodNewsFlow',
    inputSchema: z.void(),
    outputSchema: LatestFoodNewsOutputSchema,
  },
  async () => {
    // Directly call the function to get news articles.
    const articles = await getNewsFromAPI({ query: 'health' });
    return { articles };
  }
);
