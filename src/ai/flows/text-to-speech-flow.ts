'use server';

/**
 * @fileOverview Converts recipe text to speech with caching.
 *
 * - recipeToSpeech - A function that handles converting text to audio.
 * - RecipeToSpeechInput - The input type for the recipeToSpeech function.
 * - RecipeToSpeechOutput - The return type for the recipeToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

const RecipeToSpeechInputSchema = z.string();
export type RecipeToSpeechInput = z.infer<typeof RecipeToSpeechInputSchema>;

const RecipeToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type RecipeToSpeechOutput = z.infer<typeof RecipeToSpeechOutputSchema>;

// Simple in-memory cache to reduce TTS API calls and avoid hitting rate limits.
const ttsCache = new Map<string, RecipeToSpeechOutput>();

export async function recipeToSpeech(input: RecipeToSpeechInput): Promise<RecipeToSpeechOutput> {
  // Check the cache first to avoid unnecessary API calls.
  if (ttsCache.has(input)) {
    return ttsCache.get(input)!;
  }
  
  const result = await textToSpeechFlow(input);

  // Store the generated audio in the cache for future requests.
  ttsCache.set(input, result);
  
  return result;
}


async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      const bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });

      writer.write(pcmData);
      writer.end();
    });
  }


const textToSpeechFlow = ai.defineFlow(
    {
      name: 'textToSpeechFlow',
      inputSchema: RecipeToSpeechInputSchema,
      outputSchema: RecipeToSpeechOutputSchema,
    },
    async (instructions) => {
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
              },
            },
            prompt: instructions,
          });

          if (!media) {
            throw new Error('No audio was generated.');
          }

          const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
          );

          const wavData = await toWav(audioBuffer);

          return {
            audioDataUri: 'data:audio/wav;base64,' + wavData,
          };
    }
  );
