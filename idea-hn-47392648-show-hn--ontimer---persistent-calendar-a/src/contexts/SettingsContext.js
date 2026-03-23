import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSetting, saveSetting } from '../services/data/settingsRepository';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    defaultAlertSound: 'default',
    defaultVibration: true,
    defaultSnoozeDuration: 5,
    showFullAlert: true,
    premiumStatus: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = {};
      
      // Load each setting individually
      const defaultAlertSound = await getSetting('defaultAlertSound');
      if (defaultAlertSound !== null) loadedSettings.defaultAlertSound = defaultAlertSound;
      
      const defaultVibration = await getSetting('defaultVibration');
      if (defaultVibration !== null) loadedSettings.defaultVibration = defaultVibration === 'true';
      
      const defaultSnoozeDuration = await getSetting('defaultSnoozeDuration');
      if (defaultSnoozeDuration !== null) loadedSettings.defaultSnoozeDuration = parseInt(defaultSnoozeDuration);
      
      const showFullAlert = await getSetting('showFullAlert');
      if (showFullAlert !== null) loadedSettings.showFullAlert = showFullAlert === 'true';
      
      const premiumStatus = await getSetting('premiumStatus');
      if (premiumStatus !== null) loadedSettings.premiumStatus = premiumStatus === 'true';
      
      setSettings(prev => ({ ...prev, ...loadedSettings }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      await saveSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const value = {
    settings,
    updateSetting,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
