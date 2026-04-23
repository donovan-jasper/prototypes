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
      packageName: 'pocket://',
      label: 'Pocket',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'evernote://',
      label: 'Evernote',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'trello://',
      label: 'Trello',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'asana://',
      label: 'Asana',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'zoom://',
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
      packageName: 'discord://',
      label: 'Discord',
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
      packageName: 'signal://',
      label: 'Signal',
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
      packageName: 'onedrive://',
      label: 'OneDrive',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'icloud://',
      label: 'iCloud',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'googlephotos://',
      label: 'Google Photos',
      icon: undefined,
      category: 'media'
    },
    {
      packageName: 'googlekeep://',
      label: 'Google Keep',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'googlecalendar://',
      label: 'Google Calendar',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'googlemaps://',
      label: 'Google Maps',
      icon: undefined,
      category: 'navigation'
    },
    {
      packageName: 'googledrive://',
      label: 'Google Drive',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'googletranslate://',
      label: 'Google Translate',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'googlenews://',
      label: 'Google News',
      icon: undefined,
      category: 'news'
    },
    {
      packageName: 'googlesheets://',
      label: 'Google Sheets',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'googledocs://',
      label: 'Google Docs',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'googleforms://',
      label: 'Google Forms',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'googlecontacts://',
      label: 'Google Contacts',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'googlefit://',
      label: 'Google Fit',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'googlefitness://',
      label: 'Google Fitness',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'googlefitnessapp://',
      label: 'Google Fitness App',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'googlefitnessapp://',
      label: 'Google Fitness App',
      icon: undefined,
      category: 'health'
    }
  ];
};

export const launchApp = async (packageName: string) => {
  try {
    if (Platform.OS === 'ios') {
      // For iOS, use URL scheme
      const url = packageName.startsWith('http') ? packageName : packageName;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    } else {
      // For Android, use package name
      await Linking.openURL(`intent://#Intent;package=${packageName};end`);
    }
  } catch (error) {
    console.error('Error launching app:', error);
  }
};

const cacheApps = async (apps: App[]) => {
  try {
    await db.transactionAsync(async (tx) => {
      // Clear existing apps
      await tx.executeSqlAsync('DELETE FROM apps');

      // Insert new apps
      for (const app of apps) {
        await tx.executeSqlAsync(
          'INSERT INTO apps (packageName, label, icon, category) VALUES (?, ?, ?, ?)',
          [app.packageName, app.label, app.icon, app.category]
        );
      }
    });
  } catch (error) {
    console.error('Error caching apps:', error);
  }
};
