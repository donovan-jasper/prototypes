import { create } from 'zustand';

interface SessionState {
  taskName: string;
  coachId: string;
  isActive: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  startSession: (taskName: string, coachId: string) => void;
  stopSession: () => void;
  togglePause: () => void;
  reset: () => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  taskName: '',
  coachId: '',
  isActive: false,
  isPaused: false,
  elapsedSeconds: 0,

  startSession: (taskName, coachId) =>
    set({
      taskName,
      coachId,
      isActive: true,
      isPaused: false,
      elapsedSeconds: 0,
    }),

  stopSession: () =>
    set({
      isActive: false,
      isPaused: false,
    }),

  togglePause: () =>
    set((state) => ({
      isPaused: !state.isPaused,
    })),

  reset: () =>
    set({
      taskName: '',
      coachId: '',
      isActive: false,
      isPaused: false,
      elapsedSeconds: 0,
    }),

  tick: () =>
    set((state) => {
      if (!state.isActive || state.isPaused) return state;
      return { elapsedSeconds: state.elapsedSeconds + 1 };
    }),
}));
