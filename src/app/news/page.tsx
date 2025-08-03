
'use client';

import { useState, useEffect } from "react";
import { Newspaper, Loader2, ExternalLink } from "lucide-react";
import { NewsFeedForm } from "@/components/news/NewsFeedForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getLatestFoodNews, NewsArticle } from "@/ai/flows/latest-food-news-flow";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import Image from "next/image";

function NewsArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
       <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block">
         <div className="relative h-40 w-full bg-secondary">
            <Image 
                src={article.imageUrl || 'https://placehold.co/600x400.png'}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                data-ai-hint="news article"
            />
         </div>
       </Link>
      <CardContent className="p-6 flex flex-col flex-grow">
        <p className="text-sm font-semibold text-muted-foreground mb-2">
          {article.source.name} - 
          <span className="ml-1">{article.publishedAt ? format(new Date(article.publishedAt), 'PPP') : 'N/A'}</span>
        </p>
        <h3 className="font-bold text-lg leading-tight mb-3 flex-grow">
            <Link href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {article.title}
            </Link>
        </h3>
        <p className="text-sm text-foreground/80 line-clamp-3 mb-4">
            {article.description}
        </p>
        <Link href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline mt-auto">
            Read full article <ExternalLink className="h-3 w-3"/>
        </Link>
      </CardContent>
    </Card>
  );
}


export default function NewsPage() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const result = await getLatestFoodNews();
        if (result.articles) {
          setLatestNews(result.articles);
        }
      } catch (error: any) {
        console.error("Failed to fetch latest news:", error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching News',
          description: error.message || 'Could not load the latest news articles. Please try again later.'
        });
        // Set mock data on error so the page doesn't look broken
        setLatestNews([
          { title: `Could not fetch news.`, url: '#', source: { name: 'Error' }, description: 'There was an issue connecting to the news service.' },
          { title: `Please ensure your NewsAPI key is set in the .env file.`, url: '#', source: { name: 'Error' }, description: 'A valid API key is required to fetch headlines.' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-5xl mx-auto text-center mb-12 animate-fade-in-up">
        <Newspaper className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Food & Health News</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Stay updated with the latest headlines, or get a personalized feed based on your tastes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 animate-fade-in-up" style={{animationDelay: '200ms'}}>
          <NewsFeedForm />
        </div>
        <div className="lg:col-span-2 animate-fade-in-up" style={{animationDelay: '400ms'}}>
            <h2 className="text-3xl font-bold mb-6">Latest Headlines</h2>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                             <Skeleton className="h-40 w-full" />
                            <CardContent className="p-6 space-y-3">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {latestNews.map((article, index) => (
                       <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                         <NewsArticleCard article={article} />
                       </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
