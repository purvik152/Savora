'use server';

/**
 * @fileOverview An AI agent that generates creative recipe titles.
 *
 * - generateRecipeTitle - A function that handles generating title suggestions.
 * - GenerateRecipeTitleInput - The input type for the function.
 * - GenerateRecipeTitleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateRecipeTitleInputSchema = z.object({
  title: z.string().describe("The user's original recipe title."),
  description: z.string().describe('A brief description of the recipe.'),
});
export type GenerateRecipeTitleInput = z.infer<typeof GenerateRecipeTitleInputSchema>;

const GenerateRecipeTitleOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of 3-4 creative and fun alternative recipe titles.'),
});
export type GenerateRecipeTitleOutput = z.infer<typeof GenerateRecipeTitleOutputSchema>;

export async function generateRecipeTitle(input: GenerateRecipeTitleInput): Promise<GenerateRecipeTitleOutput> {
  return generateRecipeTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipeTitlePrompt',
  input: {schema: GenerateRecipeTitleInputSchema},
  output: {schema: GenerateRecipeTitleOutputSchema},
  prompt: `You are a witty and creative food blogger known for catchy recipe names.
A user has submitted a recipe with a basic title and description. Your task is to brainstorm 3-4 more exciting, fun, or descriptive titles for it.

Keep the titles relatively short and appealing.

Original Title: "{{title}}"
Description: "{{description}}"

Please provide your suggestions in the specified JSON format.`,
});

const generateRecipeTitleFlow = ai.defineFlow(
  {
    name: 'generateRecipeTitleFlow',
    inputSchema: GenerateRecipeTitleInputSchema,
    outputSchema: GenerateRecipeTitleOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
