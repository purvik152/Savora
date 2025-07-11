
"use client";

import { useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Mic, Circle, WandSparkles } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateRecipeTitle } from '@/ai/flows/generate-recipe-title-flow';
import { addCommunityRecipe } from '@/lib/community-recipes';


const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Please provide a more detailed description."),
  image: z.instanceof(FileList).refine(files => files?.length === 1, "An image is required."),
  ingredients: z.string().min(10, "Please list the ingredients."),
  instructions: z.string().min(20, "Please provide the instructions."),
  diet: z.enum(['veg', 'non-veg'], { required_error: "You need to select a diet type."}),
  imageHint: z.string().optional(),
});

export function SubmitRecipeForm() {
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      ingredients: "",
      instructions: "",
      imageHint: "community recipe",
    },
  });
  
  const currentTitle = useWatch({ control: form.control, name: 'title' });
  const currentDescription = useWatch({ control: form.control, name: 'description' });

  const handleSuggestTitles = useCallback(async () => {
      if (!currentTitle || !currentDescription) {
          toast({
              variant: 'destructive',
              title: "Can't Suggest Yet",
              description: "Please enter a title and description before getting suggestions."
          });
          return;
      }
      setIsSuggesting(true);
      setTitleSuggestions([]);
      try {
          const result = await generateRecipeTitle({
              title: currentTitle,
              description: currentDescription,
          });
          if (result.suggestions && result.suggestions.length > 0) {
              setTitleSuggestions(result.suggestions);
          } else {
              toast({ title: "Couldn't find any suggestions. Try a different description!" });
          }
      } catch (e) {
          console.error(e);
          toast({
              variant: 'destructive',
              title: "AI Error",
              description: "There was a problem getting suggestions."
          });
      } finally {
          setIsSuggesting(false);
      }
  }, [currentTitle, currentDescription, toast]);

  const handleSuggestionClick = (suggestion: string) => {
      form.setValue('title', suggestion);
      setTitleSuggestions([]);
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const imageFile = values.image[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const imageDataUri = e.target?.result as string;

        try {
            const newRecipe = addCommunityRecipe({
                title: values.title,
                description: values.description,
                image: imageDataUri,
                imageHint: values.imageHint || 'community recipe',
                ingredients: values.ingredients.split('\n').filter(line => line.trim() !== ''),
                instructions: values.instructions.split('\n').filter(line => line.trim() !== ''),
                diet: values.diet,
            });

            toast({
                title: "Recipe Submitted!",
                description: "Thank you for sharing your recipe with the community.",
            });

            form.reset();
            router.push(`/community/recipes/${newRecipe.slug}`);

        } catch (error) {
            console.error("Error submitting recipe:", error);
            toast({
                variant: 'destructive',
                title: "Submission Failed",
                description: "There was an error saving your recipe. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };
    
    reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: "Image Error",
            description: "Could not read the image file. Please try a different image.",
        });
        setLoading(false);
    }
    
    reader.readAsDataURL(imageFile);
  }

  const handleRecordNarration = () => {
    setIsRecording(is => !is);
    toast({
        title: isRecording ? "Recording Stopped" : "Recording Started",
        description: isRecording ? "Voice narration saved (simulation)." : "This is a prototype. No audio is actually being recorded.",
    });
  }

  const fileRef = form.register('image');

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Recipe Details</CardTitle>
          <CardDescription>Fill out the fields below. All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Title</FormLabel>
                    <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="e.g., Ultimate Chocolate Chip Cookies" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={handleSuggestTitles} disabled={isSuggesting}>
                            {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4"/>}
                            <span className="ml-2 hidden sm:inline">Suggest</span>
                        </Button>
                    </div>
                     {titleSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {titleSuggestions.map((suggestion, index) => (
                                <Button key={index} type="button" variant="secondary" size="sm" onClick={() => handleSuggestionClick(suggestion)}>
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Briefly describe your recipe..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Recipe Image</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" {...fileRef} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diet"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Dietary Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="veg" />
                          </FormControl>
                          <FormLabel className="font-normal">Vegetarian</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="non-veg" />
                          </FormControl>
                          <FormLabel className="font-normal">Non-Vegetarian</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List each ingredient on a new line." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List each step on a new line." className="min-h-[200px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Voice Narration (Optional)</FormLabel>
                <Card className="p-4 bg-secondary/50 flex flex-col items-center gap-4">
                    <FormDescription>
                        Record yourself reading the instructions for a voice-guided experience.
                    </FormDescription>
                    <Button type="button" size="lg" variant={isRecording ? "destructive" : "outline"} onClick={handleRecordNarration}>
                        {isRecording ? <Circle className="mr-2 h-5 w-5 fill-white" /> : <Mic className="mr-2 h-5 w-5" />}
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                </Card>
              </FormItem>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" /> Submit Recipe</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
