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
  return latestFoodNewsFlow();
}

// This is not a tool for an LLM to decide to use, but a direct function call.
// So we define it as a regular async function.
async function getNewsFromAPI(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_NEWS_API_KEY_HERE') {
    console.error("NewsAPI key not found. Please add it to your .env file.");
    // Return mock data if the API key is not set
    return [
      { title: `(Mock) The Top 10 Superfoods of the Year`, url: '#', source: 'Mock News', imageUrl: 'https://placehold.co/600x400.png' },
      { title: `(Mock) Revolutionary Diet Changes Heart Health`, url: '#', source: 'Mock News', imageUrl: 'https://placehold.co/600x400.png' },
      { title: `(Mock) Is Coffee Good For You? New Study Reveals All`, url: '#', source: 'Mock News', imageUrl: 'https://placehold.co/600x400.png' },
    ];
  }
  
  // Query for general food, nutrition, health, and recipe topics
  const url = `https://newsapi.org/v2/top-headlines?q=food,nutrition,health,recipes&category=health&language=en&pageSize=10&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
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
  } catch (error) {
    console.error("Error fetching news from NewsAPI:", error);
    // Fallback to mock data on API error
    return [
        { title: `Could not fetch latest news. Please check the server logs.`, url: '#', source: 'Error', imageUrl: 'https://placehold.co/600x400.png' },
    ];
  }
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
