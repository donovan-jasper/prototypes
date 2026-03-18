import { create } from 'zustand';
import { ScanResult } from '../lib/types';

interface StoreState {
  scans: ScanResult[];
  currentScan: ScanResult | null;
  scanCount: number;
  isPremium: boolean;
  addScan: (scan: ScanResult) => void;
  setCurrentScan: (scan: ScanResult | null) => void;
  incrementScanCount: () => void;
  setPremium: (isPremium: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  scans: [],
  currentScan: null,
  scanCount: 0,
  isPremium: false,
  addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans] })),
  setCurrentScan: (scan) => set({ currentScan: scan }),
  incrementScanCount: () => set((state) => ({ scanCount: state.scanCount + 1 })),
  setPremium: (isPremium) => set({ isPremium }),
}));
