
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
    title: "Classic Beef Tacos",
    diet: 'non-veg',
    image: '/images/recipes/classic-beef-tacos.jpg',
    imageHint: 'beef tacos',
    description: "A family-favorite taco recipe that is quick, easy, and endlessly customizable.",
    submitter: {
      name: 'TacoTuesday',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 142,
    isTopContributor: true,
  },
  {
    id: 102,
    slug: 'zesty-lentil-salad',
    title: 'Vibrant Quinoa Salad',
    diet: 'veg',
    image: '/images/recipes/vibrant-quinoa-salad.jpg',
    imageHint: 'quinoa salad',
    description: 'A colorful and nutrient-packed quinoa salad with a zesty lemon vinaigrette.',
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
    image: '/images/recipes/spicy-gochujang-wings.jpg',
    imageHint: 'chicken wings',
    description: 'Crispy, sticky, sweet, and spicy Korean-style chicken wings that are absolutely addictive.',
    submitter: {
      name: 'CurryMaster',
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
    title: "Best-Ever Black Bean Burgers",
    diet: 'veg',
    image: '/images/recipes/black-bean-burgers.jpg',
    imageHint: 'bean burger',
    description: "Hearty and flavorful homemade vegetarian burgers that even meat-eaters will love.",
    submitter: {
      name: 'BurgerBoss',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 180,
    isTopContributor: false,
  },
  {
    id: 105,
    slug: 'one-pan-lemon-herb-salmon',
    title: "Sheet Pan Salmon & Veggies",
    diet: 'non-veg',
    image: '/images/recipes/sheet-pan-salmon-and-veggies.jpg',
    imageHint: 'salmon veggies',
    description: "A healthy, delicious, and incredibly easy one-pan dinner for minimal cleanup.",
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
    title: 'Creamy Red Lentil Soup',
    diet: 'veg',
    image: '/images/recipes/creamy-lentil-soup.jpg',
    imageHint: 'lentil soup',
    description: 'A comforting and hearty soup that is surprisingly easy to make and full of flavor.',
    submitter: {
      name: 'SouperStar',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 210,
    isTopContributor: true,
  },
  {
    id: 107,
    slug: 'ultimate-breakfast-burrito',
    title: 'Hearty Breakfast Burrito',
    diet: 'non-veg',
    image: '/images/recipes/hearty-breakfast-burrito.jpg',
    imageHint: 'breakfast burrito',
    description: 'A filling and customizable breakfast burrito to keep you energized all morning.',
    submitter: {
      name: 'MorningChef',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 195,
    isTopContributor: false,
  },
  {
    id: 108,
    slug: 'creamy-avocado-pasta',
    title: 'Creamy Avocado Pasta',
    diet: 'veg',
    image: '/images/recipes/creamy-avocado-pasta.jpg',
    imageHint: 'avocado pasta',
    description: 'A surprisingly creamy and healthy pasta dish made with avocados. Ready in just 15 minutes!',
    submitter: {
      name: 'GreenGourmet',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 220,
    isTopContributor: true,
  },
  {
    id: 109,
    slug: 'honey-garlic-glazed-salmon',
    title: 'Lemon Herb Roast Chicken',
    diet: 'non-veg',
    image: '/images/recipes/lemon-herb-roast-chicken.jpg',
    imageHint: 'roast chicken',
    description: 'A juicy, flavorful roast chicken that is impressive enough for guests but easy enough for a weeknight.',
    submitter: {
      name: 'RoastMaster',
      avatar: 'https://placehold.co/128x128.png',
    },
    upvotes: 310,
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
