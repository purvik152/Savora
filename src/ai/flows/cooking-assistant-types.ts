
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const CookingAssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  message: z.string().describe("The user's latest message."),
});
export type CookingAssistantInput = z.infer<typeof CookingAssistantInputSchema>;

export const CookingAssistantOutputSchema = z.object({
  response: z.string().describe("The assistant's response."),
});
export type CookingAssistantOutput = z.infer<typeof CookingAssistantOutputSchema>;

export const cookingAssistantPrompt = ai.definePrompt({
  name: 'cookingAssistantPrompt',
  input: {schema: CookingAssistantInputSchema},
  output: {schema: CookingAssistantOutputSchema},
  system: `You are Savora, a friendly and expert AI cooking companion. Your goal is to help users with all their food-related questions. You can answer questions about recipes, cooking techniques, ingredient substitutions, meal planning, and more. Be helpful, encouraging, and clear in your responses.`,
  prompt: `{{#each history}}
{{#if (eq role 'user')}}
User: {{{content}}}
{{else}}
Model: {{{content}}}
{{/if}}
{{/each}}
User: {{{message}}}
Model:`,
});
