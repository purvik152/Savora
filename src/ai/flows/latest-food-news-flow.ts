
'use server';

/**
 * @fileOverview An AI agent that fetches the latest general food and health news.
 *
 * - getLatestFoodNews - A function that returns a list of recent news articles.
 * - LatestFoodNewsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsArticleSchema = z.object({
  title: z.string().describe('The headline of the news article.'),
  url: z.string().url().describe('The direct URL to the full news article.'),
  source: z.string().describe('The name of the news source.'),
  imageUrl: z.string().url().optional().describe('The URL for a relevant image.'),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

const LatestFoodNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema).describe('A list of the latest food and health news articles.'),
});
export type LatestFoodNewsOutput = z.infer<typeof LatestFoodNewsOutputSchema>;


export async function getLatestFoodNews(): Promise<LatestFoodNewsOutput> {
  // Correctly invoke the flow by running it without any input.
  return latestFoodNewsFlow(undefined);
}

// This is not a tool for an LLM to decide to use, but a direct function call.
async function getNewsFromAPI(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_NEWS_API_KEY_HERE') {
    throw new Error("NewsAPI key not found. Please sign up for a free key at NewsAPI.org and add it to your .env file.");
  }
  
  // Query for general food, nutrition, health topics using the /everything endpoint,
  // which is more flexible on the free plan.
  const query = encodeURIComponent('food OR health OR nutrition');
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
      const errorData = await response.json();
      console.error("NewsAPI Error:", errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  
  // Map to the schema, ensuring all fields are present
  return data.articles.map((article: any) => ({
    title: article.title || 'No title provided',
    url: article.url,
    source: article.source?.name || 'Unknown Source',
    imageUrl: article.urlToImage || 'https://placehold.co/600x400.png',
  }));
}


const latestFoodNewsFlow = ai.defineFlow(
  {
    name: 'latestFoodNewsFlow',
    inputSchema: z.undefined(),
    outputSchema: LatestFoodNewsOutputSchema,
  },
  async () => {
    // Directly call the function to get news articles.
    const articles = await getNewsFromAPI();
    return { articles };
  }
);
