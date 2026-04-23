export type Category = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';

export interface WardrobeItem {
  id: number;
  imageUri: string;
  category: Category;
  colors: string[]; // Hex color codes
  tags: string[]; // casual, formal, summer, winter, etc.
  purchasePrice?: number;
  addedDate: string; // ISO date string
  wearCount: number;
}

export interface Outfit {
  id: number;
  name: string;
  itemIds: number[]; // Array of item IDs
  createdDate: string; // ISO date string
  occasion?: string; // work, casual, formal, etc.
}

export interface WearLogEntry {
  id: number;
  itemIds: number[]; // Array of item IDs
  wornDate: string; // ISO date string
  weather: string; // sunny, rainy, etc.
  event: string; // calendar event title
}

export interface OutfitSuggestion {
  items: number[]; // Array of item IDs
  score: number; // 0-1 score of how good the match is
  context: {
    weather: string;
    temp: number;
    events: string[];
  };
}

export interface UserPreferences {
  isPro: boolean;
  favoriteColors: string[];
  stylePreference: 'casual' | 'formal' | 'mixed';
  onboardingComplete: boolean;
}
