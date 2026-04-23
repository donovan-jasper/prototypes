export interface SavedItem {
  id: number;
  url: string;
  title: string;
  type: 'video' | 'article' | 'image';
  fileUri: string;
  thumbnailUri: string | null;
  source: string;
  createdAt: number;
  collectionId: number | null;
  duration?: number;
  fileSize?: number;
}

export interface Collection {
  id: number;
  name: string;
  color: string;
  createdAt: number;
}

export interface ParsedUrlResult {
  type: 'video' | 'article' | 'image';
  title?: string;
  thumbnail?: string;
  source: string;
  downloadUrl?: string;
  duration?: number;
}
