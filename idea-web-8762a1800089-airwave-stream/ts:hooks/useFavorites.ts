import { useState, useEffect } from 'react';
import { 
  openDatabase, 
  createTables, 
  addFavorite as dbAddFavorite, 
  removeFavorite as dbRemoveFavorite, 
  getFavorites as dbGetFavorites,
  FavoriteChannel
} from '../lib/database';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteChannel[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const db = openDatabase();
      await createTables(db);
      const storedFavorites = await dbGetFavorites(db);
      setFavorites(storedFavorites);
    };

    loadFavorites();
  }, []);

  const toggleFavorite = async (channel: any) => {
    const db = openDatabase();
    const existingFavorite = favorites.find(fav => fav.id === channel.id);
    
    if (existingFavorite) {
      await dbRemoveFavorite(db, channel.id);
      setFavorites(prev => prev.filter(fav => fav.id !== channel.id));
    } else {
      await dbAddFavorite(db, channel);
      setFavorites(prev => [...prev, channel]);
    }
  };

  const isFavorite = (channelId: string) => {
    return favorites.some(fav => fav.id === channelId);
  };

  return { favorites, toggleFavorite, isFavorite };
};
