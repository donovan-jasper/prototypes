import { create } from 'zustand';
import { scheduleAlertNotification } from '../utils/notifications';

interface AlertRule {
  id: string;
  game: string;
  itemName: string;
  targetPrice: number;
  notificationType: 'price' | 'event';
}

interface AlertStore {
  rules: AlertRule[];
  activeAlerts: string[];
  createRule: (rule: Omit<AlertRule, 'id'>) => void;
  deleteRule: (ruleId: string) => void;
  checkRules: (currentPrices: Record<string, number>) => Promise<void>;
}

const useAlertStore = create<AlertStore>((set) => ({
  rules: [],
  activeAlerts: [],
  createRule: (rule) => set((state) => ({
    rules: [...state.rules, { ...rule, id: Date.now().toString() }]
  })),
  deleteRule: (ruleId) => set((state) => ({
    rules: state.rules.filter(rule => rule.id !== ruleId)
  })),
  checkRules: async (currentPrices) => {
    set((state) => {
      const newActiveAlerts: string[] = [];

      state.rules.forEach(rule => {
        const itemKey = `${rule.game}-${rule.itemName}`;
        const currentPrice = currentPrices[itemKey];

        if (currentPrice !== undefined && currentPrice <= rule.targetPrice) {
          newActiveAlerts.push(rule.id);

          // Schedule notification
          scheduleAlertNotification({
            title: 'Price Alert!',
            body: `${rule.itemName} is now ${currentPrice} (below your target of ${rule.targetPrice})`,
            data: { ruleId: rule.id }
          });
        }
      });

      return { activeAlerts: newActiveAlerts };
    });
  },
}));

export { useAlertStore };
