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
}

interface RoomStatus {
  code: string;
  creator: string;
  duration: number;
  participants: string[];
  createdAt: number;
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
          }
        : null,
    })),
}));
