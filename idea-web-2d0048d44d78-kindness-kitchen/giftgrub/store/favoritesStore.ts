import { create } from 'zustand';

const useFavoritesStore = create((set) => ({
  favorites: [],
  addFavorite: (favorite) => set((state) => ({ favorites: [...state.favorites, favorite] })),
  removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter(fav => fav.id !== id) })),
}));

export default useFavoritesStore;
