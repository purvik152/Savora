
'use client';

import type { User } from '@clerk/nextjs/server';

export interface CommunityRecipe {
  id: number;
  slug: string;
  title: string;
  diet: 'veg' | 'non-veg';
  image: string;
  imageHint: string;
  description: string;
  submitter: {
    uid: string;
    name: string;
    avatar: string;
  };
  upvotes: number;
  isTopContributor: boolean;
  ingredients?: string[];
  instructions?: string[];
}

const COMMUNITY_RECIPES_KEY = 'savora-community-recipes';

const initialCommunityRecipes: CommunityRecipe[] = [
  {
    id: 101,
    slug: 'grandmas-secret-chili',
    title: "Grandma's Secret Chili",
    diet: 'non-veg',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'chili bowl',
    description: "A secret family recipe for a hearty and flavorful chili that's been passed down for generations.",
    submitter: {
      uid: 'admin-savora',
      name: 'ChiliMaster',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 142,
    isTopContributor: true,
  },
  {
    id: 102,
    slug: 'zesty-lentil-salad',
    title: 'Zesty Lentil Salad',
    diet: 'veg',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'lentil salad',
    description: 'A light, refreshing, and protein-packed lentil salad perfect for a summer lunch.',
    submitter: {
      uid: 'user-savora',
      name: 'VeggieVibes',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 98,
    isTopContributor: false,
  },
];

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    // If no item, set the initial data
    window.localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

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

export function getCommunityRecipes(): CommunityRecipe[] {
    return getFromStorage<CommunityRecipe[]>(COMMUNITY_RECIPES_KEY, initialCommunityRecipes);
}

export function addCommunityRecipe(
    recipeData: Omit<CommunityRecipe, 'id' | 'slug' | 'submitter' | 'upvotes' | 'isTopContributor'>,
    user: { id: string, fullName?: string | null, imageUrl: string }
): CommunityRecipe {
    const recipes = getCommunityRecipes();
    
    const newRecipe: CommunityRecipe = {
        ...recipeData,
        id: Date.now(),
        slug: recipeData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        upvotes: 1,
        isTopContributor: false, // This could be calculated based on user's total contributions
        submitter: {
            uid: user.id,
            name: user.fullName || 'Anonymous Chef',
            avatar: user.imageUrl || 'https://placehold.co/128x128.png'
        }
    };

    const updatedRecipes = [newRecipe, ...recipes];
    setInStorage(COMMUNITY_RECIPES_KEY, updatedRecipes);
    return newRecipe;
}

export function upvoteRecipe(recipeId: number): CommunityRecipe[] {
    const recipes = getCommunityRecipes();
    const updatedRecipes = recipes.map(recipe => {
        if (recipe.id === recipeId) {
            return { ...recipe, upvotes: recipe.upvotes + 1 };
        }
        return recipe;
    });
    setInStorage(COMMUNITY_RECIPES_KEY, updatedRecipes);
    return updatedRecipes;
}

export function removeCommunityRecipe(recipeId: number): void {
    const recipes = getCommunityRecipes();
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    setInStorage(COMMUNITY_RECIPES_KEY, updatedRecipes);
}
