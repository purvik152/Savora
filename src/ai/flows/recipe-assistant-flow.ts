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
import { recipeToSpeech } from './text-to-speech-flow';

const RecipeAssistantInputSchema = z.object({
  recipeTitle: z.string().describe('The title of the recipe.'),
  instructions: z.array(z.string()).describe('The list of recipe instructions.'),
  currentStep: z.number().describe('The index of the current instruction step (0-based).'),
  currentInstruction: z.string().describe('The text for the current instruction step.'),
  userQuery: z.string().describe("The user's spoken query or command."),
  language: z.string().describe("The user's preferred language (e.g., 'en-US', 'es-ES', 'bn-IN')."),
});
export type RecipeAssistantInput = z.infer<typeof RecipeAssistantInputSchema>;

const RecipeAssistantOutputSchema = z.object({
  responseText: z.string().describe("The assistant's spoken response to the user. This should be the full text of the recipe instruction when requested, or a helpful answer to a question."),
  nextStep: z.number().describe("The updated step index after the interaction. This should be the index of the step the user should be on now, or -1 to end the session."),
  audioDataUri: z.string().nullable().optional().describe('The audio version of the response as a data URI.'),
});
export type RecipeAssistantOutput = z.infer<typeof RecipeAssistantOutputSchema>;

export async function recipeAssistant(input: RecipeAssistantInput): Promise<RecipeAssistantOutput> {
  return recipeAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recipeAssistantPrompt',
  input: {schema: RecipeAssistantInputSchema},
  output: {schema: z.object({ responseText: z.string(), nextStep: z.number() })},
  prompt: `You are Savvy, a friendly and helpful voice assistant for cooking. You are guiding a user through the recipe for "{{recipeTitle}}".

The user's preferred language is {{language}}. YOU MUST respond clearly and concisely in this language.

**Current State:**
- The user is on step with index {{currentStep}}.
- The instruction for this step is: "{{currentInstruction}}"
- The user just said: "{{userQuery}}"

**Your Task:**
Based on the user's query, determine the next logical step and generate the appropriate response. Your response MUST be in the specified JSON format.

**Command & Query Handling Rules:**

1.  **Navigation Commands:**
    *   **Start/Restart:** For "start", "start cooking", "begin", "start over".
        *   responseText: The full text of the first instruction (index 0).
        *   nextStep: 0.
    *   **Next:** For "next", "next step", "skip", "continue".
        *   If it is NOT the last step: responseText is the next instruction, nextStep is the index of that next instruction.
        *   If it IS the last step: responseText is a friendly closing message (e.g., "You've reached the end of the recipe. Enjoy your meal!"), nextStep is -1.
    *   **Repeat:** For "repeat", "say that again", "what was that?".
        *   responseText: The text of the current instruction again.
        *   nextStep: The same as the current step.
    *   **Previous:** For "go back", "previous step".
        *   If at the first step (index 0): responseText is the first instruction, nextStep is 0.
        *   Otherwise: responseText is the previous instruction, nextStep is the index of that previous instruction.

2.  **Session Control Commands:**
    *   **End/Stop:** For "end", "stop cooking", "cancel".
        *   responseText: A friendly closing message (e.g., "Happy cooking! See you next time.").
        *   nextStep: -1.
    *   **Pause:** For "pause", "hold on", "wait".
        *   responseText: A short confirmation like "Paused. Just say resume when you're ready."
        *   nextStep: The same as the current step.
    *   **Resume:** For "resume", "continue", "I'm ready".
        *   responseText: The text of the current instruction again.
        *   nextStep: The same as the current step.

3.  **Contextual Questions:**
    *   **Substitutions:** If the user asks for a substitute (e.g., "What can I use instead of cream?"), provide a helpful, concise suggestion. Keep nextStep the same.
    *   **Clarifications:** If the user asks a question about the current step (e.g., "how hot should the pan be?", "how long do I cook this?"), answer the question based on the recipe context. Keep nextStep the same.
    *   **General Help:** If the user asks a general cooking question not directly related to the step, provide a helpful answer. Keep nextStep the same.
    *   **Videos:** If the user asks for a video (e.g., "show me a video"), respond by saying "I can't show videos right now, but I can describe the technique for you." Keep nextStep the same.

4.  **Speech Clarity:**
    *   When you give a recipe step, your 'responseText' MUST be the full, exact text of that instruction. Do not add conversational filler like "The next step is..." or "Okay, here is step one...". Just state the instruction clearly.
    *   For answers to questions, be conversational but concise.

**Full Recipe for Context:**
{{#each instructions}}
- Step {{@index}}: {{{this}}}
{{/each}}
`,
});

const recipeAssistantFlow = ai.defineFlow(
  {
    name: 'recipeAssistantFlow',
    inputSchema: RecipeAssistantInputSchema,
    outputSchema: RecipeAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);

    // Safeguard to ensure the AI returns a valid response.
    if (!output || !output.responseText) {
        return {
            responseText: "Sorry, I didn't catch that. Please say it again.",
            nextStep: input.currentStep,
            audioDataUri: null,
        };
    }
    
    // Safeguard for the nextStep index.
    const isOutOfBounds = output.nextStep < -1 || output.nextStep >= input.instructions.length;
    if (isOutOfBounds) {
        output.nextStep = input.currentStep;
    }
    
    try {
        const ttsResult = await recipeToSpeech(output.responseText);
        return { ...output, audioDataUri: ttsResult.audioDataUri };
    } catch (error) {
        console.error("TTS Generation failed:", error);
        return { ...output, audioDataUri: null };
    }
  }
);
