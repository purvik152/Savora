
'use client';

import type { Recipe } from './recipes';

// --- User Credentials ---
export interface UserCredentials {
  username: string;
  email: string;
  password?: string; // Password is used for signup/login check, but not stored in the active user session
}

const PAST_RECIPES_KEY = 'savora-past-recipes';
const FAVORITE_RECIPES_KEY = 'savora-favorite-recipes';
const USERS_KEY = 'savora-users'; // For mock user db

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

// --- User Management (Mock Database) ---

export function getUsers(): UserCredentials[] {
    return getFromStorage<UserCredentials>(USERS_KEY);
}

export function findUserByEmail(email: string): UserCredentials | undefined {
    const users = getUsers();
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function addUser(newUser: UserCredentials): void {
    const users = getUsers();
    const updatedUsers = [...users, newUser];
    setInStorage(USERS_KEY, updatedUsers);
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
