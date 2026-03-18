import { useState, useEffect } from 'react';
import { getSettings, setSetting } from '../lib/database';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    dailyNudges: true,
  });

  const loadSettings = async () => {
    const settingsData = await getSettings();
    const settingsObj = {};
    settingsData.forEach(setting => {
      settingsObj[setting.key] = setting.value === 'true';
    });
    setSettings({ ...settings, ...settingsObj });
  };

  const updateSetting = async (key, value) => {
    await setSetting(key, value.toString());
    setSettings({ ...settings, [key]: value });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return { settings, updateSetting };
};
