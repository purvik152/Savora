
'use client';

import type { Recipe } from './recipes';

export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner';

export type MealPlan = {
  [day: string]: {
    [meal in MealSlot]: Recipe | null;
  };
};

const MEAL_PLAN_KEY_PREFIX = 'savora-meal-plan_';

export function getMealPlan(userId: string): MealPlan | null {
  if (typeof window === 'undefined' || !userId) {
    return null;
  }
  try {
    const item = window.localStorage.getItem(`${MEAL_PLAN_KEY_PREFIX}${userId}`);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading meal plan from localStorage:', error);
    return null;
  }
}

export function saveMealPlan(plan: MealPlan, userId: string): void {
  if (typeof window === 'undefined' || !userId) {
    return;
  }
  try {
    window.localStorage.setItem(`${MEAL_PLAN_KEY_PREFIX}${userId}`, JSON.stringify(plan));
  } catch (error) {
    console.error('Error saving meal plan to localStorage:', error);
  }
}
