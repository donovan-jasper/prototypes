import * as Notifications from 'expo-notifications';

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
}

export function unblockApps(): void {
  blockedApps.clear();
  notificationScheduled = false;
}

export function getBlockedApps(): string[] {
  return Array.from(blockedApps);
}

export async function showBlockedAppAlert(appName: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🧘 Stay Focused',
      body: `${appName} is blocked during your focus session. You've got this!`,
      sound: true,
    },
    trigger: null,
  });
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
