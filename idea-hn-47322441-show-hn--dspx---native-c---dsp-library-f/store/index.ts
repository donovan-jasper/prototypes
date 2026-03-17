import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initDatabase, saveSensorReading, getSensorReadings } from '@/lib/storage/database';

type Sensor = {
  id: string;
  name: string;
  type: string;
  connectionType: 'bluetooth' | 'wifi' | 'cloud';
  isConnected: boolean;
  lastUpdated: number;
};

type Alert = {
  id: string;
  sensorId: string;
  type: 'threshold' | 'disconnection' | 'battery';
  value?: number;
  condition?: 'above' | 'below';
  hysteresis?: number;
  isActive: boolean;
};

type User = {
  email: string;
  subscriptionStatus: 'free' | 'premium';
};

type FamilyMember = {
  email: string;
  accessLevel: 'viewer' | 'editor';
};

type StoreState = {
  sensors: Sensor[];
  alerts: Alert[];
  user: User | null;
  familyMembers: string[];
  subscriptionStatus: 'free' | 'premium';
  addSensor: (sensor: Sensor) => void;
  removeSensor: (id: string) => void;
  updateSensorConnection: (id: string, isConnected: boolean) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  setUser: (user: User) => void;
  upgradeToPremium: () => void;
  addFamilyMember: (email: string) => void;
  removeFamilyMember: (email: string) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      sensors: [],
      alerts: [],
      user: null,
      familyMembers: [],
      subscriptionStatus: 'free',

      addSensor: (sensor) =>
        set((state) => ({
          sensors: [...state.sensors, sensor],
        })),

      removeSensor: (id) =>
        set((state) => ({
          sensors: state.sensors.filter((sensor) => sensor.id !== id),
        })),

      updateSensorConnection: (id, isConnected) =>
        set((state) => ({
          sensors: state.sensors.map((sensor) =>
            sensor.id === id ? { ...sensor, isConnected, lastUpdated: Date.now() } : sensor
          ),
        })),

      addAlert: (alert) =>
        set((state) => ({
          alerts: [...state.alerts, alert],
        })),

      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        })),

      toggleAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
          ),
        })),

      setUser: (user) =>
        set(() => ({
          user,
          subscriptionStatus: user.subscriptionStatus,
        })),

      upgradeToPremium: () =>
        set((state) => ({
          subscriptionStatus: 'premium',
          user: state.user ? { ...state.user, subscriptionStatus: 'premium' } : null,
        })),

      addFamilyMember: (email) =>
        set((state) => ({
          familyMembers: [...state.familyMembers, email],
        })),

      removeFamilyMember: (email) =>
        set((state) => ({
          familyMembers: state.familyMembers.filter((member) => member !== email),
        })),
    }),
    {
      name: 'sensor-sync-storage',
      partialize: (state) => ({
        sensors: state.sensors,
        alerts: state.alerts,
        user: state.user,
        familyMembers: state.familyMembers,
        subscriptionStatus: state.subscriptionStatus,
      }),
    }
  )
);

// Initialize database when store is created
initDatabase();
