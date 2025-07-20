
'use client';

import { useState, useEffect } from "react";
import { Newspaper, Loader2, ExternalLink } from "lucide-react";
import { NewsFeedForm } from "@/components/news/NewsFeedForm";
import { Card, CardContent } from "@/components/ui/card";
import { getLatestFoodNews, NewsArticle } from "@/ai/flows/latest-food-news-flow";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

function NewsArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={article.url} target="_blank" rel="noopener noreferrer">
        <div className="relative h-40 w-full bg-secondary">
           <Image 
                src={article.imageUrl || 'https://placehold.co/600x400.png'}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                data-ai-hint="news article"
           />
        </div>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-muted-foreground">{article.source}</p>
          <h3 className="font-bold line-clamp-2 mt-1">{article.title}</h3>
          <div className="text-xs text-primary mt-2 flex items-center gap-1">
            Read full article <ExternalLink className="h-3 w-3"/>
          </div>
        </CardContent>
      </Link>
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
          { title: `Could not fetch news.`, url: '#', source: 'Error', imageUrl: 'https://placehold.co/600x400.png' },
          { title: `Please ensure your NewsAPI key is set in the .env file.`, url: '#', source: 'Error', imageUrl: 'https://placehold.co/600x400.png' },
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
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
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
