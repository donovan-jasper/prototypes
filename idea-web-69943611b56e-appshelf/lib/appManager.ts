import * as Application from 'expo-application';
import { Platform, Linking } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Device from 'expo-device';
import { NativeModules } from 'react-native';

const db = SQLite.openDatabase('flowdeck.db');

interface App {
  packageName: string;
  label: string;
  icon?: string;
  category?: string;
}

export const getInstalledApps = async (): Promise<App[]> => {
  if (Platform.OS === 'ios') {
    // iOS doesn't allow listing installed apps, return curated list
    return getCuratedApps();
  }

  try {
    // For Android, we'll use the native module to get installed apps
    const installedApps = await getAndroidInstalledApps();

    // Cache apps in SQLite
    await cacheApps(installedApps);
    return installedApps;
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return [];
  }
};

// Native module implementation for Android
const getAndroidInstalledApps = async (): Promise<App[]> => {
  if (Platform.OS !== 'android') {
    return [];
  }

  try {
    // Call the native module to get installed apps
    const apps = await NativeModules.AppListModule.getInstalledApps();
    return apps.map(app => ({
      packageName: app.packageName,
      label: app.label,
      icon: app.icon ? `data:image/png;base64,${app.icon}` : undefined
    }));
  } catch (error) {
    console.error('Error calling native module:', error);
    return [];
  }
};

const getCuratedApps = (): App[] => {
  // Curated list of common apps for iOS with URL schemes
  return [
    {
      packageName: 'gmail://',
      label: 'Gmail',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'maps://',
      label: 'Maps',
      icon: undefined,
      category: 'navigation'
    },
    {
      packageName: 'slack://',
      label: 'Slack',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'instagram://',
      label: 'Instagram',
      icon: undefined,
      category: 'social'
    },
    {
      packageName: 'whatsapp://',
      label: 'WhatsApp',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'messages://',
      label: 'Messages',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'calendar://',
      label: 'Calendar',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'notes://',
      label: 'Notes',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'reminders://',
      label: 'Reminders',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'spotify://',
      label: 'Spotify',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'youtube://',
      label: 'YouTube',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'netflix://',
      label: 'Netflix',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'twitter://',
      label: 'Twitter',
      icon: undefined,
      category: 'social'
    },
    {
      packageName: 'facebook://',
      label: 'Facebook',
      icon: undefined,
      category: 'social'
    },
    {
      packageName: 'linkedin://',
      label: 'LinkedIn',
      icon: undefined,
      category: 'professional'
    },
    {
      packageName: 'dropbox://',
      label: 'Dropbox',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'drive://',
      label: 'Google Drive',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'photos-redirect://',
      label: 'Photos',
      icon: undefined,
      category: 'media'
    },
    {
      packageName: 'camera://',
      label: 'Camera',
      icon: undefined,
      category: 'media'
    },
    {
      packageName: 'settings://',
      label: 'Settings',
      icon: undefined,
      category: 'system'
    },
    {
      packageName: 'app-settings://',
      label: 'App Settings',
      icon: undefined,
      category: 'system'
    },
    {
      packageName: 'tel://',
      label: 'Phone',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'safari://',
      label: 'Safari',
      icon: undefined,
      category: 'browser'
    },
    {
      packageName: 'chrome://',
      label: 'Chrome',
      icon: undefined,
      category: 'browser'
    },
    {
      packageName: 'firefox://',
      label: 'Firefox',
      icon: undefined,
      category: 'browser'
    },
    {
      packageName: 'edge://',
      label: 'Edge',
      icon: undefined,
      category: 'browser'
    },
    {
      packageName: 'brave://',
      label: 'Brave',
      icon: undefined,
      category: 'browser'
    },
    {
      packageName: 'duckduckgo://',
      label: 'DuckDuckGo',
      icon: undefined,
      category: 'browser'
    },
    {
      packageName: 'pinterest://',
      label: 'Pinterest',
      icon: undefined,
      category: 'social'
    },
    {
      packageName: 'reddit://',
      label: 'Reddit',
      icon: undefined,
      category: 'social'
    },
    {
      packageName: 'tiktok://',
      label: 'TikTok',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'snapchat://',
      label: 'Snapchat',
      icon: undefined,
      category: 'social'
    },
    {
      packageName: 'zoomus://',
      label: 'Zoom',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'skype://',
      label: 'Skype',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'telegram://',
      label: 'Telegram',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'discord://',
      label: 'Discord',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'outlook://',
      label: 'Outlook',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'applemusic://',
      label: 'Apple Music',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'podcasts://',
      label: 'Podcasts',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'appletv://',
      label: 'TV',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'appstore://',
      label: 'App Store',
      icon: undefined,
      category: 'system'
    },
    {
      packageName: 'itunes://',
      label: 'iTunes Store',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'ibooks://',
      label: 'iBooks',
      icon: undefined,
      category: 'education'
    },
    {
      packageName: 'health://',
      label: 'Health',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'workout://',
      label: 'Workout',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'wallet://',
      label: 'Wallet',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'applepay://',
      label: 'Apple Pay',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'shortcuts://',
      label: 'Shortcuts',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'files://',
      label: 'Files',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'facetime://',
      label: 'FaceTime',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'siri://',
      label: 'Siri',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'news://',
      label: 'News',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'stocks://',
      label: 'Stocks',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'weather://',
      label: 'Weather',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'compass://',
      label: 'Compass',
      icon: undefined,
      category: 'navigation'
    },
    {
      packageName: 'measure://',
      label: 'Measure',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'translate://',
      label: 'Translate',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'voice-memos://',
      label: 'Voice Memos',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'home://',
      label: 'Home',
      icon: undefined,
      category: 'smart-home'
    },
    {
      packageName: 'shortcuts://',
      label: 'Shortcuts',
      icon: undefined,
      category: 'productivity'
    }
  ];
};

const cacheApps = async (apps: App[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Clear existing apps
      tx.executeSql('DELETE FROM apps', [], () => {
        // Insert new apps
        const insertSql = 'INSERT INTO apps (packageName, label, icon, category) VALUES (?, ?, ?, ?)';
        apps.forEach(app => {
          tx.executeSql(
            insertSql,
            [app.packageName, app.label, app.icon || null, app.category || null],
            () => {},
            (_, error) => {
              console.error('Error inserting app:', error);
              return true; // continue with next statement
            }
          );
        });
      }, (_, error) => {
        console.error('Error clearing apps:', error);
        reject(error);
        return true;
      });
    }, error => {
      console.error('Transaction error:', error);
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const launchApp = async (packageName: string): Promise<void> => {
  try {
    if (Platform.OS === 'ios') {
      // For iOS, use URL scheme
      await Linking.openURL(packageName);
    } else {
      // For Android, use package name
      await Linking.openURL(`intent:#Intent;package=${packageName};end`);
    }
  } catch (error) {
    console.error('Error launching app:', error);
    throw error;
  }
};
