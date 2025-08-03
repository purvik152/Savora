

"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePersonalizedNewsFeed, PersonalizedNewsFeedOutput } from '@/ai/flows/personalized-news-feed';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ThumbsUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const formSchema = z.object({
  userSearchHistory: z.string().min(3, "Please enter at least one past search (e.g., 'keto recipes')."),
  userPreferences: z.string().min(3, "Tell us about your preferences (e.g., 'vegetarian, gluten-free')."),
});

export function NewsFeedForm() {
  const [loading, setLoading] = useState(false);
  const [newsSuggestions, setNewsSuggestions] = useState<PersonalizedNewsFeedOutput['newsSuggestions']>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userSearchHistory: "",
      userPreferences: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setNewsSuggestions([]);

    try {
      const input = {
        userSearchHistory: values.userSearchHistory.split(',').map(s => s.trim()).filter(Boolean),
        userPreferences: values.userPreferences,
      };
      const result = await generatePersonalizedNewsFeed(input);
      if (result.newsSuggestions && result.newsSuggestions.length > 0) {
        setNewsSuggestions(result.newsSuggestions);
        toast({
          title: "Success!",
          description: "Your personalized news feed is ready.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "No suggestions found",
          description: "We couldn't find any news based on your input. Try being more general.",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get news suggestions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Create My Feed</CardTitle>
          <CardDescription>Fill out the details below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="userSearchHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Past Recipe Searches</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., keto recipes, chicken pasta, vegan desserts" {...field} />
                    </FormControl>
                    <FormDescription>
                      List some recipes you've looked for, separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Preferences & Interests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I'm vegetarian and prefer Italian cuisine. I'm interested in low-carb diets."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your tastes, dietary restrictions, or health goals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Get News Suggestions</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {newsSuggestions.length > 0 && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-8">Your Top Stories</h2>
          <div className="space-y-4">
            {newsSuggestions.map((suggestion, index) => (
              <Card key={index} className="bg-background/70 overflow-hidden">
                <Link href={suggestion.url} target="_blank" rel="noopener noreferrer">
                    <div className="relative h-32 w-full bg-secondary">
                        <Image 
                            src={suggestion.imageUrl || 'https://placehold.co/600x400.png'}
                            alt={suggestion.title}
                            fill
                            className="object-cover"
                            sizes="33vw"
                            data-ai-hint="news article"
                        />
                    </div>
                </Link>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="bg-primary/20 text-primary p-2 rounded-full mt-1">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                      <Link href={suggestion.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-foreground hover:underline">
                        {suggestion.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3"/>
                          <span>Read full article</span>
                      </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
