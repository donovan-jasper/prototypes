import { create } from 'zustand';

interface SyncState {
  current: number;
  total: number;
  service: string;
  isSyncing: boolean;
  setSyncProgress: (progress: {
    current: number;
    total: number;
    service: string;
    isSyncing: boolean;
  }) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  current: 0,
  total: 0,
  service: '',
  isSyncing: false,
  setSyncProgress: (progress) => set(progress),
}));
