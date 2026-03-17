export type ContentType = 'video' | 'article' | 'image';

export interface SavedItem {
  id: number;
  url: string;
  title: string;
  type: ContentType;
  fileUri: string | null;
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

export interface DownloadProgress {
  itemId: number;
  progress: number;
  total: number;
}
