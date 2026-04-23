import { useAppStore } from '../store/appStore';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

const db = SQLite.openDatabase('flowdeck.db');

interface Mode {
  id: string;
  name: string;
  color: string;
  icon?: string;
  appIds: string[];
  triggers?: {
    time?: {
      start: string;
      end: string;
    };
    location?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
  };
}

export const switchMode = (mode: Mode) => {
  const { setActiveMode } = useAppStore.getState();
  setActiveMode(mode);

  // Save to database
  saveActiveModeToDB(mode);
};

export const getActiveMode = (): Mode | null => {
  const { activeMode } = useAppStore.getState();
  return activeMode;
};

export const shouldAutoSwitch = async (mode: Mode, currentTime?: Date, currentLocation?: Location.LocationObject): Promise<boolean> => {
  if (!mode.triggers) return false;

  const now = currentTime || new Date();

  // Check time trigger
  if (mode.triggers.time) {
    const { start, end } = mode.triggers.time;
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    if (now >= startTime && now <= endTime) {
      return true;
    }
  }

  // Check location trigger (only on Android)
  if (Platform.OS === 'android' && mode.triggers.location && currentLocation) {
    const { latitude, longitude, radius } = mode.triggers.location;

    const distance = calculateDistance(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      latitude,
      longitude
    );

    if (distance <= radius) {
      return true;
    }
  }

  return false;
};

export const autoSwitchDaemon = async () => {
  try {
    const { modes } = useAppStore.getState();
    const now = new Date();

    // Get current location if needed
    let currentLocation = null;
    const hasLocationTrigger = modes.some(mode =>
      mode.triggers?.location && Platform.OS === 'android'
    );

    if (hasLocationTrigger) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        currentLocation = await Location.getCurrentPositionAsync({});
      }
    }

    // Check each mode for auto-switch conditions
    for (const mode of modes) {
      if (await shouldAutoSwitch(mode, now, currentLocation)) {
        switchMode(mode);
        break; // Only switch to one mode at a time
      }
    }
  } catch (error) {
    console.error('Error in auto-switch daemon:', error);
  }
};

const saveActiveModeToDB = async (mode: Mode) => {
  try {
    await db.transactionAsync(async (tx) => {
      await tx.executeSqlAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        ['activeMode', JSON.stringify(mode)]
      );
    });
  } catch (error) {
    console.error('Error saving active mode to DB:', error);
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Convert to meters
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
