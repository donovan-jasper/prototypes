import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useDatabase } from '../hooks/useDatabase';
import { TimingEngine } from '../services/timing-engine';

interface AppContextType {
  hasNotificationPermission: boolean;
  requestNotificationPermission: () => Promise<void>;
  userId: string;
  isPremium: boolean;
  settings: any;
  timingEngine: TimingEngine | null;
  togglePremium: () => void; // For testing purposes only
}

const AppContext = createContext<AppContextType>({
  hasNotificationPermission: false,
  requestNotificationPermission: async () => {},
  userId: '',
  isPremium: false,
  settings: {},
  timingEngine: null,
  togglePremium: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [userId, setUserId] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [settings, setSettings] = useState({});
  const [timingEngine, setTimingEngine] = useState<TimingEngine | null>(null);
  const db = useDatabase();

  useEffect(() => {
    const initializeApp = async () => {
      // Check notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      setHasNotificationPermission(status === 'granted');

      // Initialize user
      const user = await db.getOrCreateUser();
      setUserId(user.id);
      setIsPremium(user.isPremium);

      // Load settings
      const userSettings = await db.getUserSettings(user.id);
      setSettings(userSettings);

      // Initialize timing engine
      const engine = new TimingEngine(user.id);
      setTimingEngine(engine);
    };

    initializeApp();
  }, [db]);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setHasNotificationPermission(status === 'granted');
  };

  // For testing purposes only - in a real app this would be handled by a payment processor
  const togglePremium = async () => {
    const newPremiumStatus = !isPremium;
    setIsPremium(newPremiumStatus);

    // Update in database
    await db.updateUser({
      id: userId,
      isPremium: newPremiumStatus
    });
  };

  return (
    <AppContext.Provider
      value={{
        hasNotificationPermission,
        requestNotificationPermission,
        userId,
        isPremium,
        settings,
        timingEngine,
        togglePremium,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
