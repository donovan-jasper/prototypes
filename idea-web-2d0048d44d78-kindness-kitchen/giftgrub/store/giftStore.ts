import { create } from 'zustand';
import { saveGift, getGiftHistory } from '../services/database';

const useGiftStore = create((set) => ({
  gifts: [],
  addGift: async (gift) => {
    try {
      const newGift = { ...gift, id: Date.now().toString(), status: 'preparing' };
      await saveGift(newGift);
      const updatedGifts = await getGiftHistory();
      set({ gifts: updatedGifts });
    } catch (error) {
      console.error('Failed to add gift:', error);
      throw new Error('Failed to save gift. Please try again.');
    }
  },
  updateGiftStatus: (id, status) => {
    set((state) => ({
      gifts: state.gifts.map(gift =>
        gift.id === id ? { ...gift, status } : gift
      ),
    }));
  },
  loadGifts: async () => {
    try {
      const gifts = await getGiftHistory();
      set({ gifts });
    } catch (error) {
      console.error('Failed to load gifts:', error);
      throw new Error('Failed to load gift history.');
    }
  },
}));

export default useGiftStore;
