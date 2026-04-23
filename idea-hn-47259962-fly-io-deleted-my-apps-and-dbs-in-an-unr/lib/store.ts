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

interface RecoveryWorkflow {
  id: string;
  name: string;
  provider: string;
  steps: {
    id: string;
    title: string;
    description: string;
    action?: {
      type: 'api' | 'manual';
      endpoint?: string;
      method?: 'GET' | 'POST' | 'PUT';
      body?: any;
    };
  }[];
}

interface AppState {
  services: Service[];
  alerts: Alert[];
  recoveryWorkflows: RecoveryWorkflow[];
  addService: (service: Service) => void;
  updateServiceStatus: (id: string, status: Service['status']) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (id: number) => void;
  addRecoveryWorkflow: (workflow: RecoveryWorkflow) => void;
  initializeStore: (services: Service[], alerts: Alert[], workflows: RecoveryWorkflow[]) => void;
}

export const useStore = create<AppState>((set) => ({
  services: [],
  alerts: [],
  recoveryWorkflows: [],
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
  addRecoveryWorkflow: (workflow) =>
    set((state) => ({
      recoveryWorkflows: [...state.recoveryWorkflows, workflow]
    })),
  initializeStore: (services, alerts, workflows) => set({ services, alerts, recoveryWorkflows: workflows }),
}));
