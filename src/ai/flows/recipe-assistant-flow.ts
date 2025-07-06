
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
  responseText: z.string().describe("The assistant's spoken response to the user. This should be the full text of the recipe instruction when requested."),
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

Based on the user's query, determine the next logical step and generate the appropriate response.
**IMPORTANT**: When providing a recipe instruction, your 'responseText' MUST be the full, exact text of that instruction. Do not summarize or add conversational filler like "The next step is...". Just state the instruction.

- For a query like "start" or "start cooking":
  - 'responseText' MUST be the text of the first instruction (index 0).
  - 'nextStep' MUST be 0.
- For commands like "next step" or "skip":
  - If it is not the last step: 'responseText' MUST be the text of the next instruction. 'nextStep' MUST be the index of that next instruction.
  - If it is the last step: 'responseText' MUST be a friendly closing message like "You've reached the end of the recipe. Happy cooking!". 'nextStep' MUST be -1.
- For "repeat":
  - 'responseText' MUST be the text of the current instruction again.
  - 'nextStep' MUST remain the same as the current step.
- For "go back" or "previous step":
  - If at the first step (index 0): 'responseText' MUST be the text of the first instruction. 'nextStep' MUST be 0.
  - Otherwise: 'responseText' MUST be the text of the previous instruction. 'nextStep' MUST be the index of that previous instruction.
- For "start over":
  - 'responseText' MUST be the text of the first instruction.
  - 'nextStep' MUST be 0.
- For "end" or "stop cooking":
  - 'responseText' MUST be a friendly closing message (e.g., "Happy cooking!").
  - 'nextStep' MUST be -1.
- For "pause":
  - 'responseText' MUST be a short confirmation like "Paused."
  - 'nextStep' MUST remain the same. The app will handle pausing.
- For "resume" or "continue":
  - 'responseText' MUST be "Resuming."
  - 'nextStep' MUST remain the same. The app will handle resuming.
- For questions about the current step (e.g., "how much flour?"):
  - Answer the question based on the recipe context and keep 'nextStep' the same. The full recipe instructions are available for context if needed:
{{#each instructions}}
- Step {{@index}}: {{{this}}}
{{/each}}
- If the query is unclear:
  - Ask the user to repeat or clarify.
  - 'nextStep' MUST remain the same.

Your 'nextStep' must be a valid, 0-based index within the bounds of the instructions array, or -1 to end the session. Do not return an index equal to or greater than the number of instructions.`,
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
