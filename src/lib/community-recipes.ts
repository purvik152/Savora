
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
  // Add detailed recipe fields
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
    description: 'Crispy, sticky, sweet, and spicy Korean-style chicken wings that are absolutely addictive.',
    submitter: {
      name: 'WingKing',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 256,
    isTopContributor: true,
    ingredients: [
        '2 lbs chicken wings, separated into flats and drumettes',
        '1/2 cup all-purpose flour',
        '1/2 cup cornstarch',
        '1 tsp salt',
        '1 tsp black pepper',
        'Vegetable oil, for frying',
        'For the sauce:',
        '1/2 cup gochujang (Korean chili paste)',
        '1/4 cup honey or rice syrup',
        '1/4 cup soy sauce',
        '2 tbsp rice vinegar',
        '2 tbsp minced garlic',
        '1 tbsp sesame oil'
    ],
    instructions: [
        'In a large bowl, whisk together flour, cornstarch, salt, and pepper. Add the chicken wings and toss to coat evenly.',
        'In a large pot or deep fryer, heat about 2-3 inches of vegetable oil to 350°F (175°C).',
        'Fry the wings in batches for 6-8 minutes, until golden brown and cooked through. Drain on a wire rack.',
        'While the wings are frying, combine all sauce ingredients in a small saucepan over medium heat. Bring to a simmer and cook for 2-3 minutes, until slightly thickened. Remove from heat.',
        'In a large clean bowl, pour the warm sauce over the fried wings.',
        'Toss gently until all the wings are coated in the sticky sauce.',
        'Serve immediately, garnished with sesame seeds and chopped green onions if desired.'
    ]
  },
  {
    id: 104,
    slug: 'weekend-warrior-waffles',
    title: 'Weekend Warrior Waffles',
    diet: 'veg',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'waffles breakfast',
    description: "The fluffiest, crispiest waffles to make your weekend breakfast something special.",
    submitter: {
      name: 'BreakfastQueen',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 180,
    isTopContributor: false,
  },
  {
    id: 105,
    slug: 'one-pan-lemon-herb-salmon',
    title: 'One-Pan Lemon Herb Salmon',
    diet: 'non-veg',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'salmon dinner',
    description: "A healthy, delicious, and incredibly easy one-pan dinner with salmon and veggies.",
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
    imageHint: 'bean soup',
    description: 'A rich and hearty black bean soup with a spicy kick. Perfect for a cold day.',
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

export function addCommunityRecipe(recipeData: Omit<CommunityRecipe, 'id' | 'slug' | 'submitter' | 'upvotes' | 'isTopContributor'>): CommunityRecipe {
    const recipes = getCommunityRecipes();
    const storedUser = localStorage.getItem('savora-user');
    const user = storedUser ? JSON.parse(storedUser) : { name: 'Anonymous', email: '' };

    const newRecipe: CommunityRecipe = {
        ...recipeData,
        id: Date.now(),
        slug: recipeData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        upvotes: 1,
        isTopContributor: false,
        submitter: {
            name: user.username || 'Anonymous',
            avatar: localStorage.getItem(`savora-avatar_${user.email}`) || 'https://placehold.co/128x128.png'
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
