'use server';

/**
 * @fileOverview An AI agent that adjusts recipe quantities based on serving size.
 *
 * - adjustRecipe - A function that handles scaling recipe ingredients and instructions.
 * - AdjustRecipeInput - The input type for the adjustRecipe function.
 * - AdjustRecipeOutput - The return type for the adjustRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AdjustRecipeInputSchema = z.object({
  originalIngredients: z.array(z.string()).describe('The original list of ingredients.'),
  originalInstructions: z.array(z.string()).describe('The original list of instructions.'),
  originalServings: z.number().describe('The original number of servings the recipe is for.'),
  newServings: z.number().describe('The desired new number of servings.'),
  originalPrepTime: z.string().describe('The original prep time (e.g., "10 mins").'),
  originalCookTime: z.string().describe('The original cook time (e.g., "20 mins").'),
});
export type AdjustRecipeInput = z.infer<typeof AdjustRecipeInputSchema>;

const AdjustRecipeOutputSchema = z.object({
  adjustedIngredients: z.array(z.string()).describe('The adjusted list of ingredients for the new serving size.'),
  adjustedInstructions: z.array(z.string()).describe('The adjusted list of instructions for the new serving size.'),
  adjustedPrepTime: z.string().describe('The adjusted prep time for the new serving size.'),
  adjustedCookTime: z.string().describe('The adjusted cook time for the new serving size.'),
});
export type AdjustRecipeOutput = z.infer<typeof AdjustRecipeOutputSchema>;

export async function adjustRecipe(input: AdjustRecipeInput): Promise<AdjustRecipeOutput> {
  return adjustRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustRecipePrompt',
  input: {schema: AdjustRecipeInputSchema},
  output: {schema: AdjustRecipeOutputSchema},
  prompt: `You are a meticulous recipe scaling expert. Your task is to adjust a given recipe to a new serving size.

The recipe was originally for {{originalServings}} servings. The user wants to make it for {{newServings}} servings.
Original Prep Time: {{originalPrepTime}}
Original Cook Time: {{originalCookTime}}

You must proportionally scale all ingredient quantities. For example, if the original recipe for 2 servings has "1 cup flour" and the new serving size is 4, the adjusted ingredient should be "2 cups flour".

You must also find and adjust any measurements mentioned within the instructions. For example, if an instruction says "add 1 teaspoon of salt", and the new serving is double the original, the new instruction should say "add 2 teaspoons of salt".

You must also adjust the prep and cook times.
- **Prep Time:** This usually scales linearly. If you double the servings, it's reasonable to assume prep time will increase significantly, maybe close to double. Use your best judgment.
- **Cook Time:** This often does NOT scale linearly. Baking a larger portion might take 25-50% longer, not double. Frying more items might need to be done in batches, increasing time. A larger pot of soup might take longer to come to a boil. Analyze the instructions and provide a realistic new cook time.

IMPORTANT:
- Only modify quantities. Do not change ingredient names, units of measurement (unless a larger unit is more appropriate, e.g., 4 tablespoons -> 1/4 cup), or the core cooking steps.
- Maintain the original structure and number of items in both the ingredients and instructions arrays.
- Ensure the output is provided in the exact JSON format specified, including the new prep and cook times.
- If a quantity is a range (e.g., "2-3 cloves of garlic"), scale both numbers in the range.
- Round fractions to common culinary measurements (e.g., 1/4, 1/3, 1/2, 2/3, 3/4). Avoid awkward fractions like 7/8.
- Format the final times as strings, e.g., "15 mins" or "1 hr 30 mins".

Original Ingredients:
{{#each originalIngredients}}
- {{{this}}}
{{/each}}

Original Instructions:
{{#each originalInstructions}}
{{@index}}. {{{this}}}
{{/each}}

Please provide the adjusted recipe for {{newServings}} servings, including the new prep and cook times.`,
});

const adjustRecipeFlow = ai.defineFlow(
  {
    name: 'adjustRecipeFlow',
    inputSchema: AdjustRecipeInputSchema,
    outputSchema: AdjustRecipeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
