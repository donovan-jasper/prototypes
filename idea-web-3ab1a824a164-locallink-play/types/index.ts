export interface Broadcast {
  id: string;
  activity: string;
  description?: string;
  distance: number;
  expiresAt: string;
  groupSize: number;
  userId: string;
  userName: string;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isPremium?: boolean;
}

export interface Chat {
  id: string;
  broadcastId: string;
  creatorUserId: string;
  interestedUserId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}
