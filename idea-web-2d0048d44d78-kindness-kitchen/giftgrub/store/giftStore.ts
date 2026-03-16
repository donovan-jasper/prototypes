import { create } from 'zustand';
import { saveGift, getGiftHistory } from '../services/database';

const useGiftStore = create((set) => ({
  gifts: [],
  addGift: async (gift) => {
    const newGift = { ...gift, id: Date.now().toString(), status: 'preparing' };
    await saveGift(newGift);
    set((state) => ({ gifts: [...state.gifts, newGift] }));
  },
  updateGiftStatus: (id, status) => {
    set((state) => ({
      gifts: state.gifts.map(gift =>
        gift.id === id ? { ...gift, status } : gift
      ),
    }));
  },
  loadGifts: async () => {
    const gifts = await getGiftHistory();
    set({ gifts });
  },
}));

export default useGiftStore;
