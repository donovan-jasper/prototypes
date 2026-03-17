import { Platform } from 'react-native';

interface App {
  id: string;
  name: string;
  icon: string;
  packageName: string;
}

const MOCK_APPS: App[] = [
  // Communication
  { id: '1', name: 'Gmail', packageName: 'com.google.android.gm', icon: 'https://via.placeholder.com/50/EA4335/FFFFFF?text=GM' },
  { id: '2', name: 'Messages', packageName: 'com.google.android.apps.messaging', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=MSG' },
  { id: '3', name: 'WhatsApp', packageName: 'com.whatsapp', icon: 'https://via.placeholder.com/50/25D366/FFFFFF?text=WA' },
  { id: '4', name: 'Slack', packageName: 'com.slack', icon: 'https://via.placeholder.com/50/4A154B/FFFFFF?text=SL' },
  { id: '5', name: 'Discord', packageName: 'com.discord', icon: 'https://via.placeholder.com/50/5865F2/FFFFFF?text=DC' },
  { id: '6', name: 'Telegram', packageName: 'org.telegram.messenger', icon: 'https://via.placeholder.com/50/0088CC/FFFFFF?text=TG' },
  
  // Social Media
  { id: '7', name: 'Instagram', packageName: 'com.instagram.android', icon: 'https://via.placeholder.com/50/E4405F/FFFFFF?text=IG' },
  { id: '8', name: 'Twitter', packageName: 'com.twitter.android', icon: 'https://via.placeholder.com/50/1DA1F2/FFFFFF?text=TW' },
  { id: '9', name: 'Facebook', packageName: 'com.facebook.katana', icon: 'https://via.placeholder.com/50/1877F2/FFFFFF?text=FB' },
  { id: '10', name: 'LinkedIn', packageName: 'com.linkedin.android', icon: 'https://via.placeholder.com/50/0A66C2/FFFFFF?text=LI' },
  { id: '11', name: 'TikTok', packageName: 'com.zhiliaoapp.musically', icon: 'https://via.placeholder.com/50/000000/FFFFFF?text=TT' },
  { id: '12', name: 'Reddit', packageName: 'com.reddit.frontpage', icon: 'https://via.placeholder.com/50/FF4500/FFFFFF?text=RD' },
  
  // Productivity
  { id: '13', name: 'Chrome', packageName: 'com.android.chrome', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=CH' },
  { id: '14', name: 'Drive', packageName: 'com.google.android.apps.docs', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=DR' },
  { id: '15', name: 'Docs', packageName: 'com.google.android.apps.docs.editors.docs', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=DC' },
  { id: '16', name: 'Sheets', packageName: 'com.google.android.apps.docs.editors.sheets', icon: 'https://via.placeholder.com/50/34A853/FFFFFF?text=SH' },
  { id: '17', name: 'Notion', packageName: 'notion.id', icon: 'https://via.placeholder.com/50/000000/FFFFFF?text=NT' },
  { id: '18', name: 'Todoist', packageName: 'com.todoist', icon: 'https://via.placeholder.com/50/E44332/FFFFFF?text=TD' },
  { id: '19', name: 'Evernote', packageName: 'com.evernote', icon: 'https://via.placeholder.com/50/00A82D/FFFFFF?text=EV' },
  { id: '20', name: 'Trello', packageName: 'com.trello', icon: 'https://via.placeholder.com/50/0079BF/FFFFFF?text=TR' },
  
  // Entertainment
  { id: '21', name: 'YouTube', packageName: 'com.google.android.youtube', icon: 'https://via.placeholder.com/50/FF0000/FFFFFF?text=YT' },
  { id: '22', name: 'Netflix', packageName: 'com.netflix.mediaclient', icon: 'https://via.placeholder.com/50/E50914/FFFFFF?text=NF' },
  { id: '23', name: 'Spotify', packageName: 'com.spotify.music', icon: 'https://via.placeholder.com/50/1DB954/FFFFFF?text=SP' },
  { id: '24', name: 'Twitch', packageName: 'tv.twitch.android.app', icon: 'https://via.placeholder.com/50/9146FF/FFFFFF?text=TW' },
  { id: '25', name: 'Prime Video', packageName: 'com.amazon.avod.thirdpartyclient', icon: 'https://via.placeholder.com/50/00A8E1/FFFFFF?text=PV' },
  { id: '26', name: 'Disney+', packageName: 'com.disney.disneyplus', icon: 'https://via.placeholder.com/50/113CCF/FFFFFF?text=D+' },
  
  // Shopping & Finance
  { id: '27', name: 'Amazon', packageName: 'com.amazon.mShop.android.shopping', icon: 'https://via.placeholder.com/50/FF9900/FFFFFF?text=AZ' },
  { id: '28', name: 'PayPal', packageName: 'com.paypal.android.p2pmobile', icon: 'https://via.placeholder.com/50/003087/FFFFFF?text=PP' },
  { id: '29', name: 'Venmo', packageName: 'com.venmo', icon: 'https://via.placeholder.com/50/3D95CE/FFFFFF?text=VM' },
  { id: '30', name: 'eBay', packageName: 'com.ebay.mobile', icon: 'https://via.placeholder.com/50/E53238/FFFFFF?text=EB' },
  
  // Navigation & Travel
  { id: '31', name: 'Maps', packageName: 'com.google.android.apps.maps', icon: 'https://via.placeholder.com/50/34A853/FFFFFF?text=MP' },
  { id: '32', name: 'Uber', packageName: 'com.ubercab', icon: 'https://via.placeholder.com/50/000000/FFFFFF?text=UB' },
  { id: '33', name: 'Lyft', packageName: 'me.lyft.android', icon: 'https://via.placeholder.com/50/FF00BF/FFFFFF?text=LY' },
  { id: '34', name: 'Waze', packageName: 'com.waze', icon: 'https://via.placeholder.com/50/33CCFF/FFFFFF?text=WZ' },
  { id: '35', name: 'Airbnb', packageName: 'com.airbnb.android', icon: 'https://via.placeholder.com/50/FF5A5F/FFFFFF?text=AB' },
  
  // Health & Fitness
  { id: '36', name: 'Strava', packageName: 'com.strava', icon: 'https://via.placeholder.com/50/FC4C02/FFFFFF?text=ST' },
  { id: '37', name: 'MyFitnessPal', packageName: 'com.myfitnesspal.android', icon: 'https://via.placeholder.com/50/0072C6/FFFFFF?text=MF' },
  { id: '38', name: 'Headspace', packageName: 'com.getsomeheadspace.android', icon: 'https://via.placeholder.com/50/F47D31/FFFFFF?text=HS' },
  { id: '39', name: 'Calm', packageName: 'com.calm.android', icon: 'https://via.placeholder.com/50/0F4C81/FFFFFF?text=CM' },
  
  // Photography
  { id: '40', name: 'Camera', packageName: 'com.android.camera2', icon: 'https://via.placeholder.com/50/757575/FFFFFF?text=CM' },
  { id: '41', name: 'Photos', packageName: 'com.google.android.apps.photos', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=PH' },
  { id: '42', name: 'VSCO', packageName: 'com.vsco.cam', icon: 'https://via.placeholder.com/50/000000/FFFFFF?text=VS' },
  { id: '43', name: 'Lightroom', packageName: 'com.adobe.lrmobile', icon: 'https://via.placeholder.com/50/31A8FF/FFFFFF?text=LR' },
  
  // News & Reading
  { id: '44', name: 'Pocket', packageName: 'com.ideashower.readitlater.pro', icon: 'https://via.placeholder.com/50/EF4056/FFFFFF?text=PK' },
  { id: '45', name: 'Medium', packageName: 'com.medium.reader', icon: 'https://via.placeholder.com/50/000000/FFFFFF?text=MD' },
  { id: '46', name: 'Kindle', packageName: 'com.amazon.kindle', icon: 'https://via.placeholder.com/50/FF9900/FFFFFF?text=KD' },
  
  // Utilities
  { id: '47', name: 'Calculator', packageName: 'com.android.calculator2', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=CL' },
  { id: '48', name: 'Clock', packageName: 'com.google.android.deskclock', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=CK' },
  { id: '49', name: 'Weather', packageName: 'com.google.android.apps.weather', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=WE' },
  { id: '50', name: 'Files', packageName: 'com.google.android.apps.nbu.files', icon: 'https://via.placeholder.com/50/4285F4/FFFFFF?text=FL' },
];

export const scanInstalledApps = async (): Promise<App[]> => {
  if (Platform.OS === 'android') {
    try {
      // Try to use expo-intent-launcher for Android
      const IntentLauncher = require('expo-intent-launcher');
      
      // Query installed apps via intent
      const result = await IntentLauncher.startActivityAsync('android.settings.MANAGE_APPLICATIONS_SETTINGS');
      
      // Note: This won't actually return app list, it just opens settings
      // For now, fall back to mock data
      console.log('Android detected, using mock data for now');
      return MOCK_APPS;
    } catch (error) {
      console.log('expo-intent-launcher not available, using mock data');
      return MOCK_APPS;
    }
  } else if (Platform.OS === 'ios') {
    // iOS doesn't allow querying installed apps
    // Return empty array - user will need to manually register apps
    console.log('iOS detected - manual app registration required');
    return [];
  }
  
  // Default to mock data for web/other platforms
  return MOCK_APPS;
};

export const registerManualApp = async (appName: string, packageName: string): Promise<App> => {
  // For iOS manual registration
  const newApp: App = {
    id: Date.now().toString(),
    name: appName,
    packageName: packageName,
    icon: `https://via.placeholder.com/50/4285F4/FFFFFF?text=${appName.substring(0, 2).toUpperCase()}`,
  };
  
  return newApp;
};
