
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
import { recipeToSpeech } from './text-to-speech-flow';

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
    
    if (!output?.response) {
      // Handle cases where the AI doesn't return a response
      return { response: "Sorry, I couldn't generate a response.", audioDataUri: null };
    }

    try {
      const ttsResult = await recipeToSpeech(output.response);
      return {
        response: output.response,
        audioDataUri: ttsResult.audioDataUri,
      };
    } catch (error) {
      console.error("TTS Generation failed:", error);
      // If TTS fails, still return the text response without audio.
      return {
        response: output.response,
        audioDataUri: null,
      };
    }
  }
);
