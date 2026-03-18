import { create } from 'zustand';
import { createAlertRule, getAllAlertRules, deleteAlertRule } from '../db';
import { scheduleAlertNotification } from '../utils/notifications';
import { useInventoryStore } from './inventoryStore';

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
  createRule: (rule: AlertRule) => Promise<void>;
  checkRules: () => Promise<void>;
  triggerAlert: (alert: Alert) => void;
  loadRules: () => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
}

const useAlertStore = create<AlertStore>((set, get) => ({
  rules: [],
  activeAlerts: [],
  
  createRule: async (rule) => {
    try {
      await createAlertRule(rule);
      set((state) => ({
        rules: [...state.rules, rule],
      }));
    } catch (error) {
      console.error('Failed to create alert rule:', error);
    }
  },
  
  checkRules: async () => {
    const { rules } = get();
    const { items } = useInventoryStore.getState();
    
    for (const rule of rules) {
      const matchingItems = items.filter(
        item => item.game === rule.game && 
                item.name.toLowerCase().includes(rule.itemName.toLowerCase())
      );
      
      for (const item of matchingItems) {
        if (item.value <= rule.targetPrice) {
          await scheduleAlertNotification({
            title: 'Price Alert!',
            body: `${item.name} in ${item.game} is now $${item.value} (target: $${rule.targetPrice})`,
            trigger: { seconds: 1 },
          });
          
          get().triggerAlert({
            id: Date.now().toString(),
            message: `${item.name} reached target price`,
          });
        }
      }
    }
  },
  
  triggerAlert: (alert) => set((state) => ({
    activeAlerts: [...state.activeAlerts, alert],
  })),
  
  loadRules: async () => {
    try {
      const dbRules = await getAllAlertRules();
      set({ rules: dbRules });
    } catch (error) {
      console.error('Failed to load alert rules:', error);
    }
  },
  
  deleteRule: async (ruleId) => {
    try {
      await deleteAlertRule(ruleId);
      set((state) => ({
        rules: state.rules.filter(rule => rule.id !== ruleId),
      }));
    } catch (error) {
      console.error('Failed to delete alert rule:', error);
    }
  },
}));

export { useAlertStore };
