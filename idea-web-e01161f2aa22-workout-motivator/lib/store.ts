import { create } from 'zustand';

interface SessionState {
  sessionId: string | null;
  taskName: string;
  coachId: string;
  isActive: boolean;
  elapsedSeconds: number;
  startSession: (sessionId: string, taskName: string, coachId: string) => void;
  stopSession: () => void;
  tick: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  taskName: '',
  coachId: '',
  isActive: false,
  elapsedSeconds: 0,
  startSession: (sessionId, taskName, coachId) =>
    set({
      sessionId,
      taskName,
      coachId,
      isActive: true,
      elapsedSeconds: 0,
    }),
  stopSession: () =>
    set({
      isActive: false,
    }),
  tick: () =>
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
    })),
  reset: () =>
    set({
      sessionId: null,
      taskName: '',
      coachId: '',
      isActive: false,
      elapsedSeconds: 0,
    }),
}));
