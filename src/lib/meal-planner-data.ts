'use client';

import type { Recipe } from './recipes';

export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner';

export interface DayPlan {
  Breakfast?: Recipe | null;
  Lunch?: Recipe | null;
  Dinner?: Recipe | null;
}

export interface MealPlan {
  [day: string]: DayPlan; // day is 'Sunday', 'Monday', etc.
}

const MEAL_PLAN_PREFIX = 'savora-meal-plan_';

function getCurrentUserEmail(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const storedUser = window.localStorage.getItem('savora-user');
  if (!storedUser) return null;
  try {
    const user = JSON.parse(storedUser);
    return user.email;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
}

// Helper to safely get data from localStorage
function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return null;
  }
}

// Helper to safely set data in localStorage
function setInStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
}

export function getMealPlan(): MealPlan | null {
    const email = getCurrentUserEmail();
    if (!email) return null;
    const key = `${MEAL_PLAN_PREFIX}${email}`;
    return getFromStorage<MealPlan>(key);
}

export function saveMealPlan(plan: MealPlan): void {
    const email = getCurrentUserEmail();
    if (!email) return;
    const key = `${MEAL_PLAN_PREFIX}${email}`;
    setInStorage(key, plan);
}
