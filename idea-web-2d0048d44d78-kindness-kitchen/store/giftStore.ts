import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initDatabase, saveGift } from '../services/database';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  price: number;
  image: string;
}

interface Gift {
  id: string;
  restaurant: Restaurant;
  recipientName: string;
  recipientLocation: string;
  message: string;
  amount: number;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  scheduledFor: Date;
  recurring?: 'weekly' | 'monthly' | 'annually' | null;
  paymentIntentId?: string;
  createdAt?: string;
}

interface GiftStore {
  gifts: Gift[];
  addGift: (gift: Omit<Gift, 'id'>) => void;
  updateGift: (updatedGift: Gift) => void;
  updateGiftStatus: (id: string, status: Gift['status']) => void;
  getGiftById: (id: string) => Gift | undefined;
}

export const useGiftStore = create<GiftStore>()(
  persist(
    (set, get) => ({
      gifts: [],
      addGift: (gift) => {
        const newGift = {
          ...gift,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          gifts: [...state.gifts, newGift],
        }));
        // Save to database
        saveGift(newGift);
      },
      updateGift: (updatedGift) =>
        set((state) => ({
          gifts: state.gifts.map((gift) =>
            gift.id === updatedGift.id ? updatedGift : gift
          ),
        })),
      updateGiftStatus: (id, status) =>
        set((state) => ({
          gifts: state.gifts.map((gift) =>
            gift.id === id ? { ...gift, status } : gift
          ),
        })),
      getGiftById: (id) => {
        const state = get();
        return state.gifts.find(gift => gift.id === id);
      },
    }),
    {
      name: 'gift-store',
      onRehydrateStorage: () => {
        initDatabase();
      },
    }
  )
);
