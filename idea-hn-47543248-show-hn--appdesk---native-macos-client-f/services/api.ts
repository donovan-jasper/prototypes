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
