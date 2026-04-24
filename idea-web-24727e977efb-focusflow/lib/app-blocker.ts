import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import * as Device from 'expo-device';
import * as AppUsage from 'react-native-app-usage';
import { NativeModules, Platform } from 'react-native';

interface BlockedApp {
  id: string;
  name: string;
  packageName: string;
}

export const COMMON_APPS: BlockedApp[] = [
  { id: 'instagram', name: 'Instagram', packageName: 'com.instagram.android' },
  { id: 'tiktok', name: 'TikTok', packageName: 'com.zhiliaoapp.musically' },
  { id: 'twitter', name: 'Twitter/X', packageName: 'com.twitter.android' },
  { id: 'youtube', name: 'YouTube', packageName: 'com.google.android.youtube' },
  { id: 'facebook', name: 'Facebook', packageName: 'com.facebook.katana' },
  { id: 'snapchat', name: 'Snapchat', packageName: 'com.snapchat.android' },
  { id: 'reddit', name: 'Reddit', packageName: 'com.reddit.frontpage' },
  { id: 'whatsapp', name: 'WhatsApp', packageName: 'com.whatsapp' },
];

let blockedApps: Set<string> = new Set();
let notificationScheduled = false;
let monitoringInterval: NodeJS.Timeout | null = null;

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export function blockApps(appList: string[]): void {
  blockedApps = new Set(appList);

  if (Platform.OS === 'android') {
    // Android implementation using react-native-app-usage
    AppUsage.startTracking();
    monitoringInterval = setInterval(() => {
      AppUsage.getAppList().then((apps) => {
        const blockedAppsList = Array.from(blockedApps);
        const openBlockedApp = apps.find(app =>
          blockedAppsList.includes(app.packageName) && app.foreground
        );

        if (openBlockedApp) {
          showBlockedAppAlert(openBlockedApp.packageName);
          // On Android, we can't fully block, so we just show the alert
          // The user would need to manually close the app
        }
      });
    }, 5000);
  } else if (Platform.OS === 'ios') {
    // iOS implementation using native module
    if (NativeModules.AppBlockerModule) {
      NativeModules.AppBlockerModule.blockApps(Array.from(blockedApps));
    }
  }
}

export function unblockApps(): void {
  blockedApps.clear();
  notificationScheduled = false;

  if (Platform.OS === 'android') {
    AppUsage.stopTracking();
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  } else if (Platform.OS === 'ios') {
    if (NativeModules.AppBlockerModule) {
      NativeModules.AppBlockerModule.unblockApps();
    }
  }
}

export function getBlockedApps(): string[] {
  return Array.from(blockedApps);
}

export async function showBlockedAppAlert(appName: string): Promise<void> {
  if (notificationScheduled) return;

  notificationScheduled = true;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🧘 Stay Focused',
      body: `${appName} is blocked during your focus session. You've got this!`,
      sound: true,
    },
    trigger: null,
  });

  setTimeout(() => {
    notificationScheduled = false;
  }, 5000);
}

export function isAppBlocked(appId: string): boolean {
  return blockedApps.has(appId);
}

export async function setupNotificationHandler(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function checkBlockedApps(): Promise<void> {
  if (Platform.OS === 'ios') {
    // For iOS, we need to check if any blocked apps are open
    // This would require a native module to check running apps
    // For now, we'll just show a notification if the app is opened via deep link
    const url = await Linking.getInitialURL();
    if (url && url.includes('blocked-app')) {
      const appName = url.split('blocked-app/')[1];
      if (blockedApps.has(appName)) {
        showBlockedAppAlert(appName);
      }
    }
  }
}
