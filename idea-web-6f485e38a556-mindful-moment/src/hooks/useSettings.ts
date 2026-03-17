import { useState, useEffect } from 'react';
import { useDatabase } from './useDatabase';
import { Settings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const db = useDatabase();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const user = await db.getOrCreateUser();
        const userSettings = await db.getUserSettings(user.id);
        setSettings(userSettings);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load settings'));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [db]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      if (!settings) return;

      const updatedSettings = { ...settings, ...newSettings };
      await db.updateUserSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
    }
  };

  return { settings, loading, error, updateSettings };
}
