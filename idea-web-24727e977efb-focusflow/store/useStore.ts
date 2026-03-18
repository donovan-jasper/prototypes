import { create } from 'zustand';

interface FocusSession {
  id: string;
  duration: number;
  startTime: number;
  endTime: number;
  completed?: boolean;
}

interface StoreState {
  activeSession: FocusSession | null;
  setActiveSession: (session: FocusSession) => void;
  clearActiveSession: () => void;
}

export const useStore = create<StoreState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
  clearActiveSession: () => set({ activeSession: null }),
}));
