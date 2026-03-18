export type Category = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';

export interface WardrobeItem {
  id: number;
  imageUri: string;
  category: Category;
  colors: string[];
  tags: string[];
  purchasePrice?: number;
  addedDate: string;
  wearCount: number;
}

export interface Outfit {
  id: number;
  name: string;
  itemIds: number[];
  createdDate: string;
  occasion?: string;
}

export interface WearLogEntry {
  id: number;
  itemId?: number;
  outfitId?: number;
  wornDate: string;
  weather?: string;
  event?: string;
}

export interface UserPreferences {
  isPro: boolean;
  favoriteColors: string[];
  stylePreference: 'casual' | 'formal' | 'mixed';
  onboardingComplete: boolean;
}
