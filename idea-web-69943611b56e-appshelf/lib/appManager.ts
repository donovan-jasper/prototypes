import * as Application from 'expo-application';
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Device from 'expo-device';
import { NativeModules } from 'react-native';

const db = SQLite.openDatabase('flowdeck.db');

export const getInstalledApps = async () => {
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
const getAndroidInstalledApps = async () => {
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

const getCuratedApps = () => {
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
      packageName: 'onenote://',
      label: 'OneNote',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'notion://',
      label: 'Notion',
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
      packageName: 'todoist://',
      label: 'Todoist',
      icon: undefined,
      category: 'productivity'
    },
    {
      packageName: 'outlook://',
      label: 'Outlook',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'protonmail://',
      label: 'ProtonMail',
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
      packageName: 'skype://',
      label: 'Skype',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'zoom://',
      label: 'Zoom',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'teams://',
      label: 'Microsoft Teams',
      icon: undefined,
      category: 'communication'
    },
    {
      packageName: 'fitness://',
      label: 'Fitness',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'health://',
      label: 'Health',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'strava://',
      label: 'Strava',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'myfitnesspal://',
      label: 'MyFitnessPal',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'googlefit://',
      label: 'Google Fit',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'applehealth://',
      label: 'Apple Health',
      icon: undefined,
      category: 'health'
    },
    {
      packageName: 'podcasts://',
      label: 'Podcasts',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'audible://',
      label: 'Audible',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'libby://',
      label: 'Libby',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'kindle://',
      label: 'Kindle',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'goodreads://',
      label: 'Goodreads',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'banking://',
      label: 'Banking',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'chase://',
      label: 'Chase',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'wellsfargo://',
      label: 'Wells Fargo',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'venmo://',
      label: 'Venmo',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'cashapp://',
      label: 'Cash App',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'paypal://',
      label: 'PayPal',
      icon: undefined,
      category: 'finance'
    },
    {
      packageName: 'uber://',
      label: 'Uber',
      icon: undefined,
      category: 'transportation'
    },
    {
      packageName: 'lyft://',
      label: 'Lyft',
      icon: undefined,
      category: 'transportation'
    },
    {
      packageName: 'waze://',
      label: 'Waze',
      icon: undefined,
      category: 'transportation'
    },
    {
      packageName: 'googletranslate://',
      label: 'Google Translate',
      icon: undefined,
      category: 'utilities'
    },
    {
      packageName: 'googlephotos://',
      label: 'Google Photos',
      icon: undefined,
      category: 'media'
    },
    {
      packageName: 'dropcam://',
      label: 'Dropcam',
      icon: undefined,
      category: 'home'
    },
    {
      packageName: 'ring://',
      label: 'Ring',
      icon: undefined,
      category: 'home'
    },
    {
      packageName: 'nest://',
      label: 'Nest',
      icon: undefined,
      category: 'home'
    },
    {
      packageName: 'ecobee://',
      label: 'Ecobee',
      icon: undefined,
      category: 'home'
    },
    {
      packageName: 'hue://',
      label: 'Philips Hue',
      icon: undefined,
      category: 'home'
    },
    {
      packageName: 'googlehome://',
      label: 'Google Home',
      icon: undefined,
      category: 'home'
    },
    {
      packageName: 'alexa://',
      label: 'Alexa',
      icon: undefined,
      category: 'home'
    },
    {
      packageName: 'siri://',
      label: 'Siri',
      icon: undefined,
      category: 'utilities'
    },
    {
      packageName: 'googleassistant://',
      label: 'Google Assistant',
      icon: undefined,
      category: 'utilities'
    },
    {
      packageName: 'bible://',
      label: 'Bible',
      icon: undefined,
      category: 'spiritual'
    },
    {
      packageName: 'prayer://',
      label: 'Prayer',
      icon: undefined,
      category: 'spiritual'
    },
    {
      packageName: 'meditation://',
      label: 'Meditation',
      icon: undefined,
      category: 'wellness'
    },
    {
      packageName: 'headspace://',
      label: 'Headspace',
      icon: undefined,
      category: 'wellness'
    },
    {
      packageName: 'calm://',
      label: 'Calm',
      icon: undefined,
      category: 'wellness'
    },
    {
      packageName: 'inshorts://',
      label: 'Inshorts',
      icon: undefined,
      category: 'news'
    },
    {
      packageName: 'flipboard://',
      label: 'Flipboard',
      icon: undefined,
      category: 'news'
    },
    {
      packageName: 'feeder://',
      label: 'Feeder',
      icon: undefined,
      category: 'news'
    },
    {
      packageName: 'reeder://',
      label: 'Reeder',
      icon: undefined,
      category: 'news'
    },
    {
      packageName: 'pocketcasts://',
      label: 'Pocket Casts',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'overcast://',
      label: 'Overcast',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'castro://',
      label: 'Castro',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tunein://',
      label: 'TuneIn',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'soundcloud://',
      label: 'SoundCloud',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'bandcamp://',
      label: 'Bandcamp',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'spotifyartist://',
      label: 'Spotify Artist',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tidal://',
      label: 'Tidal',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'amazonmusic://',
      label: 'Amazon Music',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'applemusic://',
      label: 'Apple Music',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'soundhound://',
      label: 'SoundHound',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'shazam://',
      label: 'Shazam',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tunein://',
      label: 'TuneIn',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'iheartradio://',
      label: 'iHeartRadio',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'pandora://',
      label: 'Pandora',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'deezer://',
      label: 'Deezer',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'lastfm://',
      label: 'Last.fm',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tidal://',
      label: 'Tidal',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'qobuz://',
      label: 'Qobuz',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tidalhiFi://',
      label: 'Tidal HiFi',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'napster://',
      label: 'Napster',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'soundcloud://',
      label: 'SoundCloud',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'bandcamp://',
      label: 'Bandcamp',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'spotifyartist://',
      label: 'Spotify Artist',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tidal://',
      label: 'Tidal',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'amazonmusic://',
      label: 'Amazon Music',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'applemusic://',
      label: 'Apple Music',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'soundhound://',
      label: 'SoundHound',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'shazam://',
      label: 'Shazam',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tunein://',
      label: 'TuneIn',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'iheartradio://',
      label: 'iHeartRadio',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'pandora://',
      label: 'Pandora',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'deezer://',
      label: 'Deezer',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'lastfm://',
      label: 'Last.fm',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tidal://',
      label: 'Tidal',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'qobuz://',
      label: 'Qobuz',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'tidalhiFi://',
      label: 'Tidal HiFi',
      icon: undefined,
      category: 'entertainment'
    },
    {
      packageName: 'napster://',
      label: 'Napster',
      icon: undefined,
      category: 'entertainment'
    }
  ];
};

const cacheApps = async (apps) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS apps (packageName TEXT PRIMARY KEY, label TEXT, icon TEXT, lastUsed INTEGER, category TEXT);'
        );

        apps.forEach(app => {
          tx.executeSql(
            'INSERT OR REPLACE INTO apps (packageName, label, icon, lastUsed, category) VALUES (?, ?, ?, ?, ?);',
            [app.packageName, app.label, app.icon || '', Date.now(), app.category || '']
          );
        });
      },
      error => {
        console.error('Error caching apps:', error);
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};
