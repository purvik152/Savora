
import { z } from 'zod';

export const NewsArticleSchema = z.object({
  title: z.string().describe('The headline of the news article.'),
  url: z.string().describe('The direct URL to the full news article.'),
  source: z.object({ name: z.string() }).describe('The news source, containing its name.'),
  imageUrl: z.string().optional().describe('The URL for a relevant image.'),
  description: z.string().optional().describe('A brief description of the article.'),
  publishedAt: z.string().optional().describe('The publication date of the article.'),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

interface GetNewsInput {
    query: string;
}

export async function getNewsFromAPI({ query }: GetNewsInput): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_NEWS_API_KEY_HERE') {
    throw new Error("NewsAPI key not found. Please sign up for a free key at NewsAPI.org and add it to your .env file.");
  }
  
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=relevancy&language=en&pageSize=10&apiKey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
      const errorData = await response.json();
      console.error("NewsAPI Error:", errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  
  // Filter out articles with null or invalid URLs before mapping
  const validArticles = data.articles.filter((article: any) => article.url);

  // Map to the schema, ensuring all fields are present
  return validArticles.map((article: any) => ({
    title: article.title || 'No title provided',
    url: article.url,
    source: { name: article.source?.name || 'Unknown Source' },
    imageUrl: article.urlToImage || undefined,
    description: article.description || '',
    publishedAt: article.publishedAt || undefined,
  })).filter((article: NewsArticle) => article.title && article.description && article.url);
}
