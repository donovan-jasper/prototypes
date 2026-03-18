import React, { createContext, useState, useEffect } from 'react';
import { fetchChannels } from '../services/channelService';
import { initDatabase, getChannels, insertChannels, getFavorites, addFavorite as dbAddFavorite, removeFavorite as dbRemoveFavorite, getAlerts, addAlert as dbAddAlert, removeAlert as dbRemoveAlert } from '../services/database';
import { DEFAULT_CHANNELS } from '../utils/constants';

interface AppContextType {
  channels: any[];
  favorites: any[];
  alerts: any[];
  addFavorite: (channelId: string) => void;
  removeFavorite: (channelId: string) => void;
  addAlert: (alert: { program: string; time: string; weather: boolean; breakingNews: boolean }) => void;
  removeAlert: (id: number) => void;
}

export const AppContext = createContext<AppContextType>({
  channels: [],
  favorites: [],
  alerts: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  addAlert: () => {},
  removeAlert: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    initDatabase();
    loadChannels();
    loadFavorites();
    loadAlerts();
  }, []);

  const loadChannels = async () => {
    try {
      const fetchedChannels = await fetchChannels();
      insertChannels(fetchedChannels);
      setChannels(fetchedChannels);
    } catch (error) {
      console.error('Error loading channels, using defaults:', error);
      insertChannels(DEFAULT_CHANNELS);
      setChannels(DEFAULT_CHANNELS);
    }
  };

  const loadFavorites = () => {
    getFavorites(setFavorites);
  };

  const loadAlerts = () => {
    getAlerts(setAlerts);
  };

  const addFavorite = (channelId: string) => {
    dbAddFavorite(channelId);
    setFavorites([...favorites, { channelId }]);
  };

  const removeFavorite = (channelId: string) => {
    dbRemoveFavorite(channelId);
    setFavorites(favorites.filter(fav => fav.channelId !== channelId));
  };

  const addAlert = (alert: { program: string; time: string; weather: boolean; breakingNews: boolean }) => {
    dbAddAlert(alert);
    setAlerts([...alerts, alert]);
  };

  const removeAlert = (id: number) => {
    dbRemoveAlert(id);
    setAlerts(alerts.filter((_, index) => index !== id));
  };

  return (
    <AppContext.Provider value={{ channels, favorites, alerts, addFavorite, removeFavorite, addAlert, removeAlert }}>
      {children}
    </AppContext.Provider>
  );
};
