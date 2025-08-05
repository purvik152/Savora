
'use server';

/**
 * @fileOverview A conversational AI agent for guiding users through recipes.
 * This file is for the general-purpose cooking assistant, not the step-by-step recipe guide.
 */

import {ai} from '@/ai/genkit';
import {
  CookingAssistantInput,
  CookingAssistantInputSchema,
  CookingAssistantOutput,
  CookingAssistantOutputSchema,
  cookingAssistantPrompt,
} from './cooking-assistant-types';

export async function cookingAssistant(input: CookingAssistantInput): Promise<CookingAssistantOutput> {
  return cookingAssistantFlow(input);
}

export const cookingAssistantFlow = ai.defineFlow(
  {
    name: 'cookingAssistantFlow',
    inputSchema: CookingAssistantInputSchema,
    outputSchema: CookingAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await cookingAssistantPrompt(input);
    
    // If the model does not return a meaningful response, provide a default one.
    if (!output?.response) {
      return { response: "I'm sorry, I didn't quite understand that. Could you rephrase?" };
    }

    return { response: output.response };
  }
);
