import { create } from 'zustand';

interface AlertRule {
  id: string;
  game: string;
  itemName: string;
  targetPrice: number;
}

interface Alert {
  id: string;
  message: string;
}

interface AlertStore {
  rules: AlertRule[];
  activeAlerts: Alert[];
  createRule: (rule: AlertRule) => void;
  checkRules: () => void;
  triggerAlert: (alert: Alert) => void;
  loadRules: () => void;
}

const useAlertStore = create<AlertStore>((set) => ({
  rules: [],
  activeAlerts: [],
  createRule: (rule) => set((state) => ({
    rules: [...state.rules, rule],
  })),
  checkRules: () => {
    // Logic to check alert rules and trigger notifications
  },
  triggerAlert: (alert) => set((state) => ({
    activeAlerts: [...state.activeAlerts, alert],
  })),
  loadRules: () => {
    // Logic to load alert rules from database
  },
}));

export { useAlertStore };
