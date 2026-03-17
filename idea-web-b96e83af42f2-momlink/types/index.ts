export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  trustScore: number;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  authorId: string;
  authorName: string;
  authorTrustScore: number;
  expiresAt: string;
  status: 'open' | 'claimed' | 'completed' | 'expired';
  createdAt: string;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  requestId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
