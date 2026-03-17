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
  type: 'threshold' | 'disconnection' | 'battery' | 'pattern';
  value?: number;
  condition?: 'above' | 'below' | 'rising' | 'falling';
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
  generateAnalyticsReport: (sensorId: string) => Promise<any>;
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

      generateAnalyticsReport: async (sensorId) => {
        const { subscriptionStatus } = useStore.getState();

        if (subscriptionStatus !== 'premium') {
          throw new Error('Analytics reports require a premium subscription');
        }

        // In a real implementation, this would call a backend service
        // to generate and return analytics reports
        return {
          sensorId,
          generatedAt: Date.now(),
          insights: [
            {
              title: 'Daily Pattern Analysis',
              description: 'Your sensor shows a consistent pattern with peaks at 8 AM and 8 PM',
              confidence: 0.92
            },
            {
              title: 'Anomaly Detection',
              description: 'Unusual reading detected at 3:45 PM today - possible sensor issue',
              confidence: 0.87
            },
            {
              title: 'Correlation Analysis',
              description: 'This sensor shows a strong correlation with your heart rate monitor',
              confidence: 0.89
            }
          ]
        };
      }
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
