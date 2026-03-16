export interface Entry {
  id: number;
  categoryId: number;
  timestamp: number;
  note: string;
  photoUri: string | null;
  weather: string | null;
  temperature: number | null;
  location: string | null;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Streak {
  current: number;
  longest: number;
  lastEntryDate: number | null;
}
