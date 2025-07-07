
'use client';

import type { Recipe } from './recipes';

// --- User Credentials ---
export interface UserCredentials {
  username: string;
  email: string;
  password?: string; // Password is used for signup/login check, but not stored in the active user session
}

// Prefixes for user-specific localStorage keys
const PAST_RECIPES_PREFIX = 'savora-past-recipes_';
const FAVORITE_RECIPES_PREFIX = 'savora-favorite-recipes_';
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

// Helper to get the current user's email
function getCurrentUserEmail(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const storedUser = window.localStorage.getItem('savora-user');
  if (!storedUser) return null;
  try {
    const user: UserCredentials = JSON.parse(storedUser);
    return user.email;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
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
  const email = getCurrentUserEmail();
  if (!email) return [];
  const key = `${PAST_RECIPES_PREFIX}${email}`;
  return getFromStorage<Recipe>(key);
}

export function addPastRecipe(recipe: Recipe): void {
  const email = getCurrentUserEmail();
  if (!email) return;
  const key = `${PAST_RECIPES_PREFIX}${email}`;

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

export function getFavoriteRecipes(): Recipe[] {
  const email = getCurrentUserEmail();
  if (!email) return [];
  const key = `${FAVORITE_RECIPES_PREFIX}${email}`;
  return getFromStorage<Recipe>(key);
}

export function addFavoriteRecipe(recipe: Recipe): void {
  const email = getCurrentUserEmail();
  if (!email) return;
  const key = `${FAVORITE_RECIPES_PREFIX}${email}`;

  const favoriteRecipes = getFromStorage<Recipe>(key);
  if (!favoriteRecipes.some((r) => r.id === recipe.id)) {
    const updatedFavorites = [...favoriteRecipes, recipe];
    setInStorage(key, updatedFavorites);
  }
}

export function removeFavoriteRecipe(recipeId: number): void {
  const email = getCurrentUserEmail();
  if (!email) return;
  const key = `${FAVORITE_RECIPES_PREFIX}${email}`;

  const favoriteRecipes = getFromStorage<Recipe>(key);
  const updatedFavorites = favoriteRecipes.filter((r) => r.id !== recipeId);
  setInStorage(key, updatedFavorites);
}

export function isFavoriteRecipe(recipeId: number): boolean {
  const email = getCurrentUserEmail();
  if (!email) return false;
  
  const favoriteRecipes = getFavoriteRecipes();
  return favoriteRecipes.some((r) => r.id === recipeId);
}
