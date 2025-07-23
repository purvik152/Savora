
import { z } from 'zod';

// Input schema for generating the diet plan
export const GenerateWeeklyDietPlanInputSchema = z.object({
  dietType: z.enum(['vegetarian', 'non-vegetarian', 'vegan']),
  dailyCalories: z.number().describe('Target daily calorie intake.'),
  allergens: z.array(z.string()).describe('List of allergens to avoid.'),
  maxCookingTime: z.number().optional().describe('Maximum cooking time per meal in minutes.'),
  dietGoal: z.enum(['weight-loss', 'muscle-gain', 'maintenance']).describe('Primary dietary goal.'),
  mealsPerDay: z.array(z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])).describe('Which meals to plan for each day.'),
});
export type GenerateWeeklyDietPlanInput = z.infer<typeof GenerateWeeklyDietPlanInputSchema>;

// Schema for a single meal
const MealSchema = z.object({
  title: z.string().describe('The name of the meal.'),
  calories: z.string().describe('Estimated calories for the meal (e.g., "450 kcal").'),
  prepTime: z.string().describe('Preparation time for the meal (e.g., "15 mins").'),
  image: z.string().url().optional().describe('URL for an image of the meal.'),
  imageHint: z.string().optional().describe('A hint for generating an image if one is not available.'),
  ingredients: z.array(z.string()).describe('List of ingredients.'),
  instructions: z.array(z.string()).describe('Step-by-step cooking instructions.'),
});
export type Meal = z.infer<typeof MealSchema>;

// Schema for a full day's plan
const DayPlanSchema = z.object({
  Breakfast: MealSchema.optional(),
  Lunch: MealSchema.optional(),
  Dinner: MealSchema.optional(),
  Snacks: MealSchema.optional(),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

// Output schema for the entire weekly plan
export const WeeklyPlanSchema = z.object({
  Monday: DayPlanSchema,
  Tuesday: DayPlanSchema,
  Wednesday: DayPlanSchema,
  Thursday: DayPlanSchema,
  Friday: DayPlanSchema,
  Saturday: DayPlanSchema,
  Sunday: DayPlanSchema,
});
export type WeeklyPlan = z.infer<typeof WeeklyPlanSchema>;
