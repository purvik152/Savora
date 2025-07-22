'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-news-feed.ts';
import '@/ai/flows/recipe-assistant-flow.ts';
import '@/ai/flows/adjust-recipe-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
import '@/ai/flows/parse-ingredients-flow.ts';
import '@/ai/flows/translate-recipe-flow.ts';
import '@/ai/flows/mood-based-suggestions-flow.ts';
import '@/ai/flows/generate-recipe-title-flow.ts';
import '@/ai/flows/latest-food-news-flow.ts';
import '@/ai/flows/suggest-by-ingredients-flow.ts';
import '@/ai/flows/activity-based-suggestions-flow.ts';
import '@/ai/flows/generate-recipe-by-goal-flow.ts';
import '@/ai/flows/generate-recipe-by-goal-types.ts';
import '@/ai/flows/import-recipe-from-url-flow.ts';
import '@/ai/flows/adapt-recipe-flow.ts';
import '@/ai/flows/generate-recipe-image-flow.ts';
import '@/ai/flows/chef-challenge-flow.ts';
