import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, Interaction } from '../types';
import { getContacts, getInteractions } from '../lib/database';

interface ContactState {
  contacts: Contact[];
  interactions: Interaction[];
  loading: boolean;
  error: Error | null;
  fetchData: () => Promise<void>;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addInteraction: (interaction: Interaction) => void;
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      contacts: [],
      interactions: [],
      loading: false,
      error: null,

      fetchData: async () => {
        try {
          set({ loading: true, error: null });
          const [contacts, interactions] = await Promise.all([
            getContacts(),
            getInteractions(),
          ]);
          set({ contacts, interactions, loading: false });
        } catch (err) {
          console.error('Error fetching data:', err);
          set({ error: err instanceof Error ? err : new Error('Failed to load data'), loading: false });
        }
      },

      addContact: (contact) => {
        set((state) => ({
          contacts: [...state.contacts, contact],
        }));
      },

      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id ? { ...contact, ...updates } : contact
          ),
        }));
      },

      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
          interactions: state.interactions.filter((interaction) => interaction.contactId !== id),
        }));
      },

      addInteraction: (interaction) => {
        set((state) => ({
          interactions: [...state.interactions, interaction],
          contacts: state.contacts.map((contact) =>
            contact.id === interaction.contactId
              ? { ...contact, lastContact: interaction.date }
              : contact
          ),
        }));
      },
    }),
    {
      name: 'contact-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        contacts: state.contacts,
        interactions: state.interactions,
      }),
    }
  )
);
