export interface Gift {
  id: number;
  title: string;
  category: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface Recipient {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  preferences?: {
    birthday?: string;
    anniversary?: string;
    notificationsEnabled?: boolean;
    favoriteCategory?: string;
  };
  lastGift?: SentGift | null;
}

export interface SentGift {
  id: number;
  giftId: number;
  recipientId: number;
  message?: string | null;
  status: 'sent' | 'delivered' | 'redeemed' | 'failed';
  sentAt: string;
  redeemedAt?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: 'free' | 'pro';
  createdAt: string;
}

export interface CartItem {
  gift: Gift;
  recipient: Recipient;
  message?: string;
}
