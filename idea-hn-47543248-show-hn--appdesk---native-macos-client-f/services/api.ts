import { initializeDatabase, addApp, getApps } from './database';

export const setupApp = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Example: Add a sample app if none exist
    const apps = await getApps();
    if (apps.length === 0) {
      await addApp({
        id: '1',
        name: 'My App',
        bundle_id: 'com.example.myapp',
        icon_url: 'https://example.com/icon.png'
      });
    }

    console.log('App setup completed');
    return true;
  } catch (error) {
    console.error('App setup failed:', error);
    return false;
  }
};

export const getAppStoreData = async (appId: string): Promise<any> => {
  try {
    // In a real implementation, this would call the App Store Connect API
    // For this prototype, we'll return mock data
    console.log(`Fetching data for app: ${appId}`);

    // Generate mock data for the last 30 days
    const mockData = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      mockData.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 1000) + 100,
        downloads: Math.floor(Math.random() * 5000) + 500,
        ratings: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 50) + 5
      });
    }

    return mockData.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Failed to fetch App Store data:', error);
    throw error;
  }
};
