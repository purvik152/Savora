
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

**Current State:**
- The user is on step with index {{currentStep}}.
- The instruction for this step is: "{{currentInstruction}}"
- The user just said: "{{userQuery}}"

**Your Task:**
Based on the user's query, determine the next logical step and generate the appropriate response. Your response MUST be in the specified JSON format.

**Response Rules:**
- **Providing Instructions:** When you give a recipe step, your 'responseText' MUST be the full, exact text of that instruction. Do not add conversational filler like "The next step is..." or "Okay, here is step one...". Just state the instruction.
- **Valid \`nextStep\`:** Your 'nextStep' must be a valid, 0-based index within the bounds of the instructions array, or -1 to end the session. It must NOT be equal to or greater than the number of instructions.

**Command Handling:**

*   **Starting & Restarting:**
    *   For queries like "start", "start cooking", or "start over":
        *   \`responseText\`: The full text of the first instruction (index 0).
        *   \`nextStep\`: \`0\`.

*   **Navigating Steps:**
    *   For "next", "next step", or "skip":
        *   If it is NOT the last step: \`responseText\` is the next instruction, \`nextStep\` is the index of that next instruction.
        *   If it IS the last step: \`responseText\` is a friendly closing message (e.g., "You've reached the end of the recipe. Happy cooking!"), \`nextStep\` is \`-1\`.
    *   For "repeat" or "say that again":
        *   \`responseText\`: The text of the current instruction again.
        *   \`nextStep\`: The same as the current step.
    *   For "go back" or "previous step":
        *   If at the first step (index 0): \`responseText\` is the first instruction, \`nextStep\` is \`0\`.
        *   Otherwise: \`responseText\` is the previous instruction, \`nextStep\` is the index of that previous instruction.

*   **Session Control:**
    *   For "end" or "stop cooking":
        *   \`responseText\`: A friendly closing message (e.g., "Happy cooking!").
        *   \`nextStep\`: \`-1\`.
    *   For "pause":
        *   \`responseText\`: A short confirmation like "Paused."
        *   \`nextStep\`: The same as the current step. (The app will handle the actual pausing).
    *   For "resume" or "continue":
        *   \`responseText\`: The text of the current instruction again.
        *   \`nextStep\`: The same as the current step.
    *   For "wait" or "hold on":
        *   \`responseText\`: A confirmation like "Okay, I'll wait. Let me know when you're ready."
        *   \`nextStep\`: The same as the current step.

*   **Questions & Unclear Queries:**
    *   For questions about the current step (e.g., "how much flour?"): Answer the question based on the recipe context and keep \`nextStep\` the same.
    *   If the query is unclear: Ask for clarification and keep \`nextStep\` the same.

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
