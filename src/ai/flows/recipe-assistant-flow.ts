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
  currentInstruction: z.string().describe('The text for the current instruction step.'),
  userQuery: z.string().describe("The user's spoken query or command."),
  language: z.string().describe("The user's preferred language (e.g., 'en-US', 'es-ES')."),
});
export type RecipeAssistantInput = z.infer<typeof RecipeAssistantInputSchema>;

const RecipeAssistantOutputSchema = z.object({
  responseText: z.string().describe("The assistant's spoken response to the user."),
  nextStep: z.number().describe("The updated step index after the interaction. This should be the index of the step the user should be on now, or -1 to end the session."),
});
export type RecipeAssistantOutput = z.infer<typeof RecipeAssistantOutputSchema>;

export async function recipeAssistant(input: RecipeAssistantInput): Promise<RecipeAssistantOutput> {
  return recipeAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recipeAssistantPrompt',
  input: {schema: RecipeAssistantInputSchema},
  output: {schema: RecipeAssistantOutputSchema},
  prompt: `You are Savora, a friendly and helpful voice assistant for cooking. You are guiding a user through the recipe for "{{recipeTitle}}".

The user's preferred language is {{language}}. YOU MUST respond clearly and concisely in this language.

The user is currently on step with index {{currentStep}}. The instruction for this step is: "{{currentInstruction}}"

The user just said: "{{userQuery}}"

Based on the user's query, provide a helpful, conversational response and determine the next logical step index.
- For a query like "start" or "start cooking": Respond with the very first instruction and set 'nextStep' to 0.
- For commands like "next step" or "skip":
  - If it is not the last step, respond with the next instruction and update 'nextStep' to the next index.
  - If it is the last step, respond by saying they have reached the end of the recipe and set 'nextStep' to -1 to end the session.
- For "repeat": Say the current instruction again. 'nextStep' remains the same.
- For "go back" or "previous step": Respond with the previous instruction and update 'nextStep' to the previous index. If at the first step, just repeat the first step's instructions and keep 'nextStep' at 0.
- For "start over": Respond with the first instruction and set 'nextStep' to 0.
- For "end" or "stop cooking": Give a friendly closing message (e.g., "Happy cooking!") and set 'nextStep' to -1 to end the session.
- For "pause": Respond with a short confirmation like "Paused." and keep 'nextStep' the same. The front-end client will handle pausing the audio.
- For "resume" or "continue": Respond with "Resuming." and keep 'nextStep' the same. The front-end client will handle resuming the audio.
- For questions about the current step (e.g., "how much flour?"): Answer the question based on the recipe context and keep 'nextStep' the same. The full recipe instructions are available for context if needed:
{{#each instructions}}
- Step {{@index}}: {{{this}}}
{{/each}}
- If the query is unclear: Ask the user to repeat or clarify, and keep 'nextStep' as the current step.

Your 'responseText' should be what you would say out loud.
Your 'nextStep' must be a valid, 0-based index within the bounds of the instructions array, or -1 to end the session. Do not return an index equal to the length of the instructions array.`,
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
    if (output) {
        // Allow -1 for ending the session
        const isOutOfBounds = output.nextStep < -1 || output.nextStep >= input.instructions.length;
        if (isOutOfBounds) {
            // If the AI gives an invalid step, fallback to the current step.
            output.nextStep = input.currentStep; 
        }
    }
    return output!;
  }
);
