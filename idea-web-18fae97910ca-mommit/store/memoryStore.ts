import { create } from 'zustand';
import { Memory, Space } from '../lib/types';
import { getMemoriesForUser, getSpacesForUser, createSpace as dbCreateSpace } from '../lib/db';
import * as SecureStore from 'expo-secure-store';

interface MemoryState {
  memories: Memory[];
  spaces: Space[];
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchMemories: () => Promise<void>;
  fetchSpaces: () => Promise<void>;
  addMemory: (memory: Memory) => void;
  toggleComplete: (memoryId: string) => void;
  snoozeMemory: (memoryId: string) => void;
  setUserId: (userId: string) => Promise<void>;
  clearUser: () => Promise<void>;
  addSpace: (space: Space) => void;
  updateSpace: (space: Space) => void;
  createSpace: (name: string, members: string[]) => Promise<Space>;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  spaces: [],
  userId: null,
  isLoading: false,
  error: null,

  fetchMemories: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const memories = await getMemoriesForUser(userId);
      set({ memories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch memories', isLoading: false });
    }
  },

  fetchSpaces: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ isLoading: true, error: null });
    try {
      const spaces = await getSpacesForUser(userId);
      set({ spaces, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch spaces', isLoading: false });
    }
  },

  addMemory: (memory: Memory) => {
    set(state => ({
      memories: [memory, ...state.memories]
    }));
  },

  toggleComplete: (memoryId: string) => {
    set(state => ({
      memories: state.memories.map(memory =>
        memory.id === memoryId ? { ...memory, completed: !memory.completed } : memory
      )
    }));
  },

  snoozeMemory: (memoryId: string) => {
    // In a real app, you would update the trigger time
    console.log(`Snoozing memory ${memoryId}`);
  },

  setUserId: async (userId: string) => {
    await SecureStore.setItemAsync('userId', userId);
    set({ userId });
    // Fetch initial data
    await get().fetchMemories();
    await get().fetchSpaces();
  },

  clearUser: async () => {
    await SecureStore.deleteItemAsync('userId');
    set({ userId: null, memories: [], spaces: [] });
  },

  addSpace: (space: Space) => {
    set(state => ({
      spaces: [...state.spaces, space]
    }));
  },

  updateSpace: (updatedSpace: Space) => {
    set(state => ({
      spaces: state.spaces.map(space =>
        space.id === updatedSpace.id ? updatedSpace : space
      )
    }));
  },

  createSpace: async (name: string, members: string[]) => {
    const { userId } = get();
    if (!userId) throw new Error('User not authenticated');

    const space = await dbCreateSpace(name, userId, members);
    set(state => ({
      spaces: [...state.spaces, space]
    }));
    return space;
  },
}));

// Initialize the store with user data from SecureStore
(async () => {
  const userId = await SecureStore.getItemAsync('userId');
  if (userId) {
    useMemoryStore.setState({ userId });
    // Fetch initial data
    await useMemoryStore.getState().fetchMemories();
    await useMemoryStore.getState().fetchSpaces();
  }
})();
