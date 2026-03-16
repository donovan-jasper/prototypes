export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUri: string;
  inventory: number;
  platforms: string[];
  createdAt: string;
}

export interface Platform {
  id: number;
  name: string;
  apiKey: string;
  connectedAt: string;
}

export interface Sale {
  id: number;
  productId: number;
  platformId: number;
  amount: number;
  soldAt: string;
}

export interface Message {
  id: number;
  platformId: number;
  buyerName: string;
  content: string;
  read: boolean;
  receivedAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  isPremium: boolean;
  subscriptionStatus: string;
}
