// ... existing imports ...

export const getUserSettings = async () => {
  const result = await db.getFirstAsync('SELECT * FROM user_settings LIMIT 1;');
  return result as {
    id: number;
    userId: string;
    premiumStatus: number;
    notificationPreferences: string;
    theme: string;
    streak?: number;
  } | null;
};

// ... rest of the existing code ...
