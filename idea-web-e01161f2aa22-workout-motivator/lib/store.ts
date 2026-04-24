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
  setAudioMode: (mode: 'foreground' | 'background' | 'ambient') => void;
  audioMode: 'foreground' | 'background' | 'ambient';
}

export const useSessionStore = create<SessionState>((set) => ({
  taskName: '',
  coachId: '',
  isActive: false,
  isPaused: false,
  elapsedSeconds: 0,
  audioMode: 'foreground',

  startSession: (taskName, coachId) =>
    set({
      taskName,
      coachId,
      isActive: true,
      isPaused: false,
      elapsedSeconds: 0,
      audioMode: 'foreground',
    }),

  stopSession: () =>
    set({
      isActive: false,
      isPaused: false,
      audioMode: 'foreground',
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
      audioMode: 'foreground',
    }),

  tick: () =>
    set((state) => {
      if (!state.isActive || state.isPaused) return state;
      return { elapsedSeconds: state.elapsedSeconds + 1 };
    }),

  setAudioMode: (mode) =>
    set({ audioMode: mode }),
}));
