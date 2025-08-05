
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const MessageSchema = z.object({
  isUser: z.boolean().optional().describe("Set to true if the message is from the user."),
  isModel: z.boolean().optional().describe("Set to true if the message is from the AI model."),
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
  output: {schema: z.object({ response: z.string() })},
  system: `You are Savvy, a friendly, expert AI cooking companion for the Savora app. Your goal is to help users with all their food-related questions.

- For all general cooking questions, substitutions, meal planning, or casual conversation, use your own extensive knowledge.
- Be helpful, encouraging, and clear in your responses.`,
  prompt: `{{#each history}}
{{#if this.isUser}}
User: {{{this.content}}}
{{/if}}
{{#if this.isModel}}
Model: {{{this.content}}}
{{/if}}
{{/each}}
User: {{{message}}}
Model:`,
});
