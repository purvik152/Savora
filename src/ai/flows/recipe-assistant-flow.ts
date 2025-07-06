'use server';

/**
 * @fileOverview A conversational AI agent for guiding users through recipes.
 *
 * - recipeAssistant - A function that handles the conversational recipe guidance.
 * - RecipeAssistantInput - The input type for the recipeAssistant function.
 * - RecipeAssistantOutput - The return type for the recipeAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const RecipeAssistantInputSchema = z.object({
  recipeTitle: z.string().describe('The title of the recipe.'),
  instructions: z.array(z.string()).describe('The list of recipe instructions.'),
  currentStep: z.number().describe('The index of the current instruction step (0-based).'),
  userQuery: z.string().describe("The user's spoken query or command."),
  language: z.string().describe("The user's preferred language (e.g., 'en-US', 'es-ES')."),
});
export type RecipeAssistantInput = z.infer<typeof RecipeAssistantInputSchema>;

const RecipeAssistantOutputSchema = z.object({
  responseText: z.string().describe("The assistant's spoken response to the user."),
  nextStep: z.number().describe("The updated step index after the interaction. This should be the index of the step the user should be on now."),
});
export type RecipeAssistantOutput = z.infer<typeof RecipeAssistantOutputSchema>;

export async function recipeAssistant(input: RecipeAssistantInput): Promise<RecipeAssistantOutput> {
  return recipeAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recipeAssistantPrompt',
  input: {schema: RecipeAssistantInputSchema},
  output: {schema: RecipeAssistantOutputSchema},
  template: {
    helpers: {
      add: (a: number, b: number) => a + b,
    },
  },
  prompt: `You are Savora, a friendly and helpful voice assistant for cooking. You are guiding a user through the recipe for "{{recipeTitle}}".

The user's preferred language is {{language}}. YOU MUST respond clearly and concisely in this language.

Here are all the steps for the recipe:
{{#each instructions}}
Step {{add @index 1}}: {{{this}}}
{{/each}}

The user is currently on Step {{add currentStep 1}}: "{{lookup instructions currentStep}}"

The user just said: "{{userQuery}}"

Based on the user's query, provide a helpful, conversational response and determine the next logical step index.
- If the user asks for the "next" step, provide the next instruction and set 'nextStep' to the index of that instruction.
- If the user asks to "repeat" the step, provide the current instruction again and keep 'nextStep' the same.
- If the user asks to go "back" or to the "previous" step, provide the previous instruction and update 'nextStep' to the index of that previous step.
- If the user asks a question about the current step (e.g., "how much flour?"), answer it based on the recipe context if possible, and keep 'nextStep' the same unless they also ask to move on.
- If the query is unclear or off-topic, politely ask for clarification and keep 'nextStep' the same.

Your entire response MUST be in the user's language: {{language}}.
Your 'responseText' should be what you would say out loud.
Your 'nextStep' must be a valid, 0-based index within the bounds of the instructions array.`,
});

const recipeAssistantFlow = ai.defineFlow(
  {
    name: 'recipeAssistantFlow',
    inputSchema: RecipeAssistantInputSchema,
    outputSchema: RecipeAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // Add a safeguard for the nextStep index.
    if (output && (output.nextStep < 0 || output.nextStep >= input.instructions.length)) {
        output.nextStep = input.currentStep; // Fallback to current step if index is out of bounds
    }
    return output!;
  }
);
