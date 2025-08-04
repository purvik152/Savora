
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
    
    // If the model does not return a meaningful response, provide a default one.
    if (!output?.response) {
      // This handles cases where a command is understood but no text is generated.
      const defaultResponse = "Okay, I'll wait for your next instruction.";
      try {
        const ttsResult = await recipeToSpeech(defaultResponse);
        return { response: defaultResponse, audioDataUri: ttsResult.audioDataUri };
      } catch (ttsError) {
        console.error("TTS Generation failed for default response:", ttsError);
        return { response: defaultResponse, audioDataUri: null };
      }
    }

    try {
      // If there is a response, attempt to generate audio for it.
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
