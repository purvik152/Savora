
'use client';

import type { Recipe as FullRecipe } from './recipes';
import { recipeToSpeech } from '@/ai/flows/text-to-speech-flow';

// The full recipe definition
export type Recipe = FullRecipe;

// A version of the recipe specifically for offline storage
export interface OfflineRecipe extends Recipe {
    audioDataUri?: string;
}

// Prefixes for user-specific localStorage keys
const PAST_RECIPES_PREFIX = 'savora-past-recipes_';
const FAVORITE_RECIPES_PREFIX = 'savora-favorite-recipes_';
const OFFLINE_RECIPES_PREFIX = 'savora-offline-recipes_';

// Helper to safely get data from localStorage
function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return [];
  }
}

// Helper to safely set data in localStorage
function setInStorage<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
}

// --- Past Recipes ---

export function getPastRecipes(userId: string): Recipe[] {
  if (!userId) return [];
  const key = `${PAST_RECIPES_PREFIX}${userId}`;
  return getFromStorage<Recipe>(key);
}

export function addPastRecipe(recipe: Recipe, userId: string): void {
  if (!userId) return;
  const key = `${PAST_RECIPES_PREFIX}${userId}`;

  const pastRecipes = getFromStorage<Recipe>(key);
  // Avoid duplicates, but move to top if it exists
  const existingIndex = pastRecipes.findIndex((r) => r.id === recipe.id);
  if (existingIndex > -1) {
    pastRecipes.splice(existingIndex, 1);
  }
  const updatedRecipes = [recipe, ...pastRecipes];
  setInStorage(key, updatedRecipes.slice(0, 50)); // Limit to 50 past recipes
}

// --- Favorite Recipes ---

export function getFavoriteRecipes(userId: string): Recipe[] {
  if (!userId) return [];
  const key = `${FAVORITE_RECIPES_PREFIX}${userId}`;
  return getFromStorage<Recipe>(key);
}

export function addFavoriteRecipe(recipe: Recipe, userId: string): void {
  if (!userId) return;
  const key = `${FAVORITE_RECIPES_PREFIX}${userId}`;

  const favoriteRecipes = getFromStorage<Recipe>(key);
  if (!favoriteRecipes.some((r) => r.id.toString() === recipe.id.toString())) {
    const updatedFavorites = [...favoriteRecipes, recipe];
    setInStorage(key, updatedFavorites);
  }
}

export function removeFavoriteRecipe(recipeId: string, userId: string): void {
  if (!userId) return;
  const key = `${FAVORITE_RECIPES_PREFIX}${userId}`;

  const favoriteRecipes = getFromStorage<Recipe>(key);
  const updatedFavorites = favoriteRecipes.filter((r) => r.id.toString() !== recipeId);
  setInStorage(key, updatedFavorites);
}

export function isFavoriteRecipe(recipeId: string, userId: string): boolean {
  if (!userId) return false;
  
  const favoriteRecipes = getFavoriteRecipes(userId);
  return favoriteRecipes.some((r) => r.id.toString() === recipeId);
}


// --- Offline Recipes ---

function getOfflineRecipes(userId: string): OfflineRecipe[] {
    if (!userId) return [];
    const key = `${OFFLINE_RECIPES_PREFIX}${userId}`;
    return getFromStorage<OfflineRecipe>(key);
}

export async function saveRecipeForOffline(recipe: Recipe, userId: string): Promise<void> {
    if (!userId) throw new Error("User ID is required.");

    // 1. Generate the audio narration from the instructions
    const instructionsText = recipe.instructions.join('\n');
    const ttsResult = await recipeToSpeech(instructionsText);
    
    // 2. Create the offline recipe object
    const offlineRecipe: OfflineRecipe = {
        ...recipe,
        audioDataUri: ttsResult.audioDataUri,
    };

    // 3. Save to localStorage
    const key = `${OFFLINE_RECIPES_PREFIX}${userId}`;
    const offlineRecipes = getOfflineRecipes(userId);
    
    // Remove if it already exists to add the new version
    const updatedRecipes = offlineRecipes.filter(r => r.slug !== recipe.slug);
    updatedRecipes.unshift(offlineRecipe); // Add to the front

    setInStorage(key, updatedRecipes);
}

export function isRecipeAvailableOffline(slug: string, userId: string): boolean {
    if (!userId) return false;
    const offlineRecipes = getOfflineRecipes(userId);
    return offlineRecipes.some(r => r.slug === slug);
}

export function getOfflineRecipe(slug: string, userId: string): OfflineRecipe | undefined {
    if (!userId) return undefined;
    const offlineRecipes = getOfflineRecipes(userId);
    return offlineRecipes.find(r => r.slug === slug);
}
