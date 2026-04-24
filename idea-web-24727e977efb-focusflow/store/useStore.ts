import { create } from 'zustand';

interface FocusSession {
  id: string;
  duration: number;
  startTime: number;
  endTime: number;
  blockedApps: string[];
  completed?: boolean;
}

interface Room {
  code: string;
  creator: string;
  duration: number;
  participants: string[];
  createdAt: number;
  timeRemaining: number;
}

interface RoomStatus {
  code: string;
  creator: string;
  duration: number;
  participants: string[];
  createdAt: number;
  timeRemaining: number;
}

interface StoreState {
  activeSession: FocusSession | null;
  activeRoom: Room | null;
  setActiveSession: (session: FocusSession) => void;
  clearActiveSession: () => void;
  setActiveRoom: (room: Room) => void;
  clearActiveRoom: () => void;
  updateRoomParticipants: (participants: string[]) => void;
  updateRoomStatus: (status: RoomStatus) => void;
  updateRoomTimer: (timeRemaining: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  activeSession: null,
  activeRoom: null,
  setActiveSession: (session) => set({ activeSession: session }),
  clearActiveSession: () => set({ activeSession: null }),
  setActiveRoom: (room) => set({ activeRoom: room }),
  clearActiveRoom: () => set({ activeRoom: null }),
  updateRoomParticipants: (participants) =>
    set((state) => ({
      activeRoom: state.activeRoom
        ? { ...state.activeRoom, participants }
        : null,
    })),
  updateRoomStatus: (status) =>
    set((state) => ({
      activeRoom: state.activeRoom
        ? {
            ...state.activeRoom,
            participants: status.participants,
            duration: status.duration,
            timeRemaining: status.timeRemaining,
          }
        : null,
    })),
  updateRoomTimer: (timeRemaining) =>
    set((state) => ({
      activeRoom: state.activeRoom
        ? { ...state.activeRoom, timeRemaining }
        : null,
    })),
}));
