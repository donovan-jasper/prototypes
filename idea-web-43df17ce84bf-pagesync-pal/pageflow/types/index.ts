export type MediaType = 'book' | 'audiobook' | 'movie' | 'tv' | 'podcast';
export type ProgressUnit = 'page' | 'chapter' | 'episode' | 'timestamp' | 'percentage';

export interface Media {
  id: string;
  title: string;
  type: MediaType;
  currentProgress: number;
  totalProgress: number;
  unit: ProgressUnit;
  coverUrl?: string;
  linkedFormats?: string[];
  lastUpdated: Date;
  isPremium?: boolean;
}
