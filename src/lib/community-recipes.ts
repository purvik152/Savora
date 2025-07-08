'use client';

import type { UserCredentials } from './user-data';

export interface CommunityRecipe {
  id: number;
  slug: string;
  title: string;
  diet: 'veg' | 'non-veg';
  image: string;
  imageHint: string;
  description: string;
  submitter: {
    name: string;
    avatar: string;
  };
  upvotes: number;
  isTopContributor: boolean;
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
    description: "A hearty chili recipe passed down through generations. It's got a secret ingredient!",
    submitter: {
      name: 'CoolCook_22',
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
    description: 'A vibrant and refreshing lentil salad that is perfect for summer picnics.',
    submitter: {
      name: 'VeggieVibes',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 98,
    isTopContributor: false,
  },
  {
    id: 103,
    slug: 'spicy-gochujang-wings',
    title: 'Spicy Gochujang Wings',
    diet: 'non-veg',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'chicken wings',
    description: 'Crispy, sticky, and spicy Korean-style chicken wings that are absolutely addictive.',
    submitter: {
      name: 'ChefMaster',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 256,
    isTopContributor: true,
  },
  {
    id: 104,
    slug: 'weekend-warrior-waffles',
    title: "Weekend Warrior Waffles",
    diet: 'veg',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'waffles breakfast',
    description: "The crispiest, fluffiest waffles you'll ever make. Perfect for a lazy Sunday morning.",
    submitter: {
      name: 'BreakfastKing',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 180,
    isTopContributor: false,
  },
  {
    id: 105,
    slug: 'one-pan-lemon-herb-salmon',
    title: "One-Pan Lemon Herb Salmon",
    diet: 'non-veg',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'salmon dinner',
    description: "A healthy and incredibly easy one-pan dinner. Salmon and veggies roasted to perfection.",
    submitter: {
      name: 'EasyEats',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 115,
    isTopContributor: false,
  },
  {
    id: 106,
    slug: 'spicy-black-bean-soup',
    title: 'Spicy Black Bean Soup',
    diet: 'veg',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'black bean soup',
    description: 'A thick, hearty, and spicy black bean soup that will warm you up from the inside out. Vegan friendly!',
    submitter: {
      name: 'SouperStar',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 210,
    isTopContributor: true,
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
