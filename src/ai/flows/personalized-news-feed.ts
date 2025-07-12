
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

const NewsArticleSchema = z.object({
  title: z.string().describe('The headline of the news article.'),
  url: z.string().url().describe('The direct URL to the full news article.'),
});

const PersonalizedNewsFeedOutputSchema = z.object({
  newsSuggestions: z.array(NewsArticleSchema).describe('A list of personalized news suggestions with titles and URLs.'),
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
  outputSchema: z.array(NewsArticleSchema),
},
async (input) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_NEWS_API_KEY_HERE') {
    console.error("NewsAPI key not found. Please add it to your .env file.");
    // Return mock data if the API key is not set
    return [
      { title: `(Mock) How to cook ${input.query} like a pro`, url: '#' },
      { title: `(Mock) The health benefits of a ${input.query}-rich diet`, url: '#' },
    ];
  }

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(input.query)}&sortBy=relevancy&language=en&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Return up to 5 relevant articles with titles and URLs
    return data.articles.slice(0, 5).map((article: any) => ({
      title: article.title,
      url: article.url,
    }));
  } catch (error) {
    console.error("Error fetching news from NewsAPI:", error);
    // Fallback to mock data on API error
    return [
        { title: `Could not fetch news about ${input.query}. Please check the server logs.`, url: '#' },
    ];
  }
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
  system: `You are a personalized news curator. Analyze the user's past recipe searches and preferences to determine relevant food and health news. Use the getNewsSuggestions tool to fetch news articles. The news articles should match the users past search history and any provided user preferences. For example, if a user frequently searches for 'keto recipes' and has a preference for 'low-carb diets', prioritize news related to ketogenic diets and low-carb health benefits. The tool will return a list of article titles and URLs. You must pass these on to the user.`,
  prompt: `User Search History: {{{userSearchHistory}}}
User Preferences: {{{userPreferences}}}

Based on this information, what news suggestions do you have for the user?`,
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
