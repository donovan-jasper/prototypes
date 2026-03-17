import { create } from 'zustand';
import { Equity } from '../lib/types';
import { calculateEquityValue, calculateVestedShares } from '../lib/calculations';
import db from '../lib/db';

interface EquityState {
  equities: Equity[];
  addEquity: (equity: Equity) => void;
  removeEquity: (id: string) => void;
  updateEquity: (id: string, updates: Partial<Equity>) => void;
  loadEquities: () => void;
  totalValue: number;
  clearAll: () => void;
}

export const useEquityStore = create<EquityState>((set, get) => ({
  equities: [],
  totalValue: 0,

  addEquity: (equity) => {
    db.runSync(
      'INSERT INTO equities (id, company_name, shares, strike_price, current_price, grant_date, vesting_years) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [equity.id, equity.companyName, equity.shares, equity.strikePrice, equity.currentPrice, equity.grantDate.toISOString(), equity.vestingYears]
    );
    set((state) => {
      const newEquities = [...state.equities, equity];
      return {
        equities: newEquities,
        totalValue: calculateTotalValue(newEquities)
      };
    });
  },

  removeEquity: (id) => {
    db.runSync('DELETE FROM equities WHERE id = ?', [id]);
    set((state) => {
      const newEquities = state.equities.filter((e) => e.id !== id);
      return {
        equities: newEquities,
        totalValue: calculateTotalValue(newEquities)
      };
    });
  },

  updateEquity: (id, updates) => {
    set((state) => {
      const newEquities = state.equities.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      );
      return {
        equities: newEquities,
        totalValue: calculateTotalValue(newEquities)
      };
    });
  },

  loadEquities: () => {
    const rows = db.getAllSync('SELECT * FROM equities');
    const equities = rows.map((row: any) => ({
      id: row.id,
      companyName: row.company_name,
      shares: row.shares,
      strikePrice: row.strike_price,
      currentPrice: row.current_price,
      grantDate: new Date(row.grant_date),
      vestingYears: row.vesting_years
    }));
    set({ equities, totalValue: calculateTotalValue(equities) });
  },

  clearAll: () => set({ equities: [], totalValue: 0 })
}));

const calculateTotalValue = (equities: Equity[]): number => {
  return equities.reduce((sum, equity) => {
    const vestedShares = calculateVestedShares(
      equity.shares,
      equity.grantDate,
      new Date(),
      equity.vestingYears
    );
    return sum + calculateEquityValue(vestedShares, equity.strikePrice, equity.currentPrice);
  }, 0);
};
