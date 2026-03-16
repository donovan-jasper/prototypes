import { create } from 'zustand';
import { createMemory, getMemories, updateMemory, deleteMemory, createSpace, addMemberToSpace } from '../lib/db';
import { parseNaturalLanguage, generateSuggestions } from '../lib/ai';
import { scheduleNotification, cancelNotification } from '../lib/notifications';
import { setupGeofence } from '../lib/location';

interface MemoryState {
  memories: any[];
  spaces: any[];
  suggestions: any[];
  notificationEnabled: boolean;
  locationEnabled: boolean;
  addMemory: (memory: any) => void;
  toggleComplete: (id: string) => void;
  snoozeMemory: (id: string) => void;
  deleteMemory: (id: string) => void;
  fetchMemories: () => void;
  fetchSpaces: () => void;
  toggleNotification: () => void;
  toggleLocation: () => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  spaces: [],
  suggestions: [],
  notificationEnabled: true,
  locationEnabled: true,

  addMemory: async (memory) => {
    createMemory(memory, (id) => {
      const newMemory = { ...memory, id };
      set((state) => ({ memories: [...state.memories, newMemory] }));
      if (memory.trigger_type === 'time' && get().notificationEnabled) {
        scheduleNotification(newMemory);
      } else if (memory.trigger_type === 'location' && get().locationEnabled) {
        setupGeofence(newMemory);
      }
    });
  },

  toggleComplete: (id) => {
    const memory = get().memories.find((m) => m.id === id);
    if (memory) {
      updateMemory(id, { ...memory, completed: !memory.completed }, () => {
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, completed: !m.completed } : m
          ),
        }));
      });
    }
  },

  snoozeMemory: (id) => {
    const memory = get().memories.find((m) => m.id === id);
    if (memory) {
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + 10); // Snooze for 10 minutes
      updateMemory(id, { ...memory, trigger_value: snoozeTime.toISOString() }, () => {
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === id ? { ...m, trigger_value: snoozeTime.toISOString() } : m
          ),
        }));
        if (memory.trigger_type === 'time' && get().notificationEnabled) {
          cancelNotification(id);
          scheduleNotification({ ...memory, trigger_value: snoozeTime.toISOString() });
        }
      });
    }
  },

  deleteMemory: (id) => {
    deleteMemory(id, () => {
      set((state) => ({
        memories: state.memories.filter((m) => m.id !== id),
      }));
      if (get().notificationEnabled) {
        cancelNotification(id);
      }
    });
  },

  fetchMemories: () => {
    getMemories((memories) => {
      set({ memories });
      generateSuggestions(memories).then((suggestions) => {
        set({ suggestions });
      });
    });
  },

  fetchSpaces: () => {
    // Implement fetching spaces from database
    set({ spaces: [] });
  },

  toggleNotification: () => {
    set((state) => ({ notificationEnabled: !state.notificationEnabled }));
  },

  toggleLocation: () => {
    set((state) => ({ locationEnabled: !state.locationEnabled }));
  },
}));
