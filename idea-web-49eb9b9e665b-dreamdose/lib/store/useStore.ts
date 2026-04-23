import { create } from 'zustand';
import { Session } from '../session/sessionManager';

interface StoreState {
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  clearCurrentSession: () => void;
}

export const useStore = create<StoreState>((set) => ({
  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),
  clearCurrentSession: () => set({ currentSession: null }),
}));
