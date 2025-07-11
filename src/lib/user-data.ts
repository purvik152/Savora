
'use client';

import type { Recipe } from './recipes';

// Prefixes for user-specific localStorage keys
const PAST_RECIPES_PREFIX = 'savora-past-recipes_';
const FAVORITE_RECIPES_PREFIX = 'savora-favorite-recipes_';

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
  if (!favoriteRecipes.some((r) => r.id === recipe.id)) {
    const updatedFavorites = [...favoriteRecipes, recipe];
    setInStorage(key, updatedFavorites);
  }
}

export function removeFavoriteRecipe(recipeId: number, userId: string): void {
  if (!userId) return;
  const key = `${FAVORITE_RECIPES_PREFIX}${userId}`;

  const favoriteRecipes = getFromStorage<Recipe>(key);
  const updatedFavorites = favoriteRecipes.filter((r) => r.id !== recipeId);
  setInStorage(key, updatedFavorites);
}

export function isFavoriteRecipe(recipeId: number, userId: string): boolean {
  if (!userId) return false;
  
  const favoriteRecipes = getFavoriteRecipes(userId);
  return favoriteRecipes.some((r) => r.id === recipeId);
}
