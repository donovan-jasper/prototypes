import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initDatabase, saveGift } from '../services/database';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  image: string;
}

interface Gift {
  id: string;
  restaurant: Restaurant;
  recipientName: string;
  message: string;
  amount: number;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  scheduledFor: Date;
  createdAt?: string;
}

interface GiftStore {
  gifts: Gift[];
  addGift: (gift: Omit<Gift, 'id'>) => void;
  updateGift: (updatedGift: Gift) => void;
  updateGiftStatus: (id: string, status: Gift['status']) => void;
}

export const useGiftStore = create<GiftStore>()(
  persist(
    (set) => ({
      gifts: [],
      addGift: (gift) =>
        set((state) => ({
          gifts: [
            ...state.gifts,
            {
              ...gift,
              id: Date.now().toString(),
            },
          ],
        })),
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
    }),
    {
      name: 'gift-store',
      onRehydrateStorage: () => {
        initDatabase();
      },
    }
  )
);
