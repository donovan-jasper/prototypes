import { create } from 'zustand';

interface Service {
  id: string;
  name: string;
  provider: string;
  status: 'healthy' | 'unhealthy' | 'deleted';
  lastCheck?: number;
  metadata?: any;
}

interface Alert {
  id: number;
  serviceId: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  resolved?: boolean;
}

interface AppState {
  services: Service[];
  alerts: Alert[];
  addService: (service: Service) => void;
  updateServiceStatus: (id: string, status: Service['status']) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (id: number) => void;
  initializeStore: (services: Service[], alerts: Alert[]) => void;
}

export const useStore = create<AppState>((set) => ({
  services: [],
  alerts: [],
  addService: (service) => set((state) => ({ services: [...state.services, service] })),
  updateServiceStatus: (id, status) =>
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, status, lastCheck: Date.now() } : s)),
    })),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
    })),
  initializeStore: (services, alerts) => set({ services, alerts }),
}));
