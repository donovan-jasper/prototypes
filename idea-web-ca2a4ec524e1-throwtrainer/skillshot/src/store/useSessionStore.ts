import create from 'zustand';

interface SessionState {
  currentSession: any;
  attempts: any[];
  isActive: boolean;
  startSession: () => void;
  endSession: () => void;
  logAttempt: (attempt: any) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  currentSession: null,
  attempts: [],
  isActive: false,
  startSession: () => set({ currentSession: Date.now(), isActive: true }),
  endSession: () => set({ isActive: false }),
  logAttempt: (attempt) => set((state) => ({ attempts: [...state.attempts, attempt] })),
}));
