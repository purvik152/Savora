
'use client';

import type { Recipe } from './recipes';

const PAST_RECIPES_KEY = 'savora-past-recipes';
const FAVORITE_RECIPES_KEY = 'savora-favorite-recipes';

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

export function getPastRecipes(): Recipe[] {
  return getFromStorage<Recipe>(PAST_RECIPES_KEY);
}

export function addPastRecipe(recipe: Recipe): void {
  const pastRecipes = getPastRecipes();
  // Avoid duplicates, but move to top if it exists
  const existingIndex = pastRecipes.findIndex((r) => r.id === recipe.id);
  if (existingIndex > -1) {
    pastRecipes.splice(existingIndex, 1);
  }
  const updatedRecipes = [recipe, ...pastRecipes];
  setInStorage(PAST_RECIPES_KEY, updatedRecipes.slice(0, 50)); // Limit to 50 past recipes
}


// --- Favorite Recipes ---

export function getFavoriteRecipes(): Recipe[] {
  return getFromStorage<Recipe>(FAVORITE_RECIPES_KEY);
}

export function addFavoriteRecipe(recipe: Recipe): void {
  const favoriteRecipes = getFavoriteRecipes();
  if (!favoriteRecipes.some((r) => r.id === recipe.id)) {
    const updatedFavorites = [...favoriteRecipes, recipe];
    setInStorage(FAVORITE_RECIPES_KEY, updatedFavorites);
  }
}

export function removeFavoriteRecipe(recipeId: number): void {
  const favoriteRecipes = getFavoriteRecipes();
  const updatedFavorites = favoriteRecipes.filter((r) => r.id !== recipeId);
  setInStorage(FAVORITE_RECIPES_KEY, updatedFavorites);
}

export function isFavoriteRecipe(recipeId: number): boolean {
  const favoriteRecipes = getFavoriteRecipes();
  return favoriteRecipes.some((r) => r.id === recipeId);
}
