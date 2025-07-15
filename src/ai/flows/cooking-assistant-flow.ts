
'use server';

/**
 * @fileOverview A general-purpose AI cooking assistant.
 *
 * - cookingAssistant - A function that handles conversational cooking questions.
 */

import {ai} from '@/ai/genkit';
import {
  cookingAssistantPrompt,
  CookingAssistantInput,
  CookingAssistantInputSchema,
  CookingAssistantOutput,
  CookingAssistantOutputSchema,
} from './cooking-assistant-types';


export async function cookingAssistant(input: CookingAssistantInput): Promise<CookingAssistantOutput> {
  return cookingAssistantFlow(input);
}

const cookingAssistantFlow = ai.defineFlow(
  {
    name: 'cookingAssistantFlow',
    inputSchema: CookingAssistantInputSchema,
    outputSchema: CookingAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await cookingAssistantPrompt(input);

    if (!output) {
      return { response: "Sorry, I'm having trouble thinking right now. Please try again." };
    }

    return { response: output.response };
  }
);
