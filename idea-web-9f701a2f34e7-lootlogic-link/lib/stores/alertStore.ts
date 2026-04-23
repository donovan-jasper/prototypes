import { create } from 'zustand';
import { scheduleAlertNotification } from '../utils/notifications';
import { fetchItemPrice } from '../api/priceService';

interface AlertRule {
  id: string;
  game: string;
  itemId: string;
  itemName: string;
  targetPrice: number;
  notificationType: 'price' | 'event';
}

interface AlertStore {
  rules: AlertRule[];
  activeAlerts: string[];
  createRule: (rule: Omit<AlertRule, 'id'>) => void;
  deleteRule: (ruleId: string) => void;
  checkRules: (currentPrices?: Record<string, number>) => Promise<void>;
}

const useAlertStore = create<AlertStore>((set, get) => ({
  rules: [],
  activeAlerts: [],
  createRule: (rule) => set((state) => ({
    rules: [...state.rules, { ...rule, id: Date.now().toString() }]
  })),
  deleteRule: (ruleId) => set((state) => ({
    rules: state.rules.filter(rule => rule.id !== ruleId),
    activeAlerts: state.activeAlerts.filter(alertId => alertId !== ruleId)
  })),
  checkRules: async (currentPrices) => {
    const rules = get().rules;
    const newActiveAlerts: string[] = [];

    for (const rule of rules) {
      try {
        let currentPrice: number;

        if (currentPrices && currentPrices[`${rule.game}-${rule.itemName}`]) {
          currentPrice = currentPrices[`${rule.game}-${rule.itemName}`];
        } else {
          currentPrice = await fetchItemPrice(rule.game, rule.itemId);
        }

        if (currentPrice <= rule.targetPrice) {
          newActiveAlerts.push(rule.id);

          await scheduleAlertNotification({
            title: 'Price Alert!',
            body: `${rule.itemName} is now ${currentPrice} (below your target of ${rule.targetPrice})`,
            data: { ruleId: rule.id }
          });
        }
      } catch (error) {
        console.error(`Error checking rule for ${rule.itemName}:`, error);
      }
    }

    set({ activeAlerts: newActiveAlerts });
  },
}));

export { useAlertStore };
