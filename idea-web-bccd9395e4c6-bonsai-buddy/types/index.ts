export interface Plant {
  id: string;
  name: string;
  species: string;
  wateringFrequency: number;
  lastWatered?: string;
  lastFertilized?: string;
  photoUris: string[];
  notes?: string;
  createdAt: string;
}

export interface CareReminder {
  id: string;
  plantId: string;
  type: 'water' | 'fertilize' | 'prune';
  scheduledFor: string;
  completed: boolean;
}

export interface CommunityPost {
  id: string;
  userId: string;
  plantId: string;
  photoUri: string;
  caption: string;
  likes: number;
  createdAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
}
