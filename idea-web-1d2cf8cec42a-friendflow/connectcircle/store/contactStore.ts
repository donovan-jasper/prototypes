import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, Interaction } from '../types';
import { initDatabase, getContacts, insertContact, updateContact, deleteContact, logInteraction, getInteractionsByContact } from '../lib/database';
import { getOverdueContacts } from '../lib/analytics';

interface ContactState {
  contacts: Contact[];
  interactions: Interaction[];
  loading: boolean;
  error: string | null;
  selectedContact: Contact | null;
  overdueContacts: Contact[];
  upcomingReminders: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => Promise<void>;
  updateContact: (contact: Contact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  logInteraction: (interaction: Omit<Interaction, 'id'>) => Promise<void>;
  setSelectedContact: (contact: Contact | null) => void;
  fetchContacts: () => Promise<void>;
  fetchInteractions: (contactId: string) => Promise<void>;
}

export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      contacts: [],
      interactions: [],
      loading: false,
      error: null,
      selectedContact: null,
      overdueContacts: [],
      upcomingReminders: [],

      addContact: async (contact) => {
        set({ loading: true, error: null });
        try {
          await insertContact(contact);
          await get().fetchContacts();
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
        }
      },

      updateContact: async (contact) => {
        set({ loading: true, error: null });
        try {
          await updateContact(contact);
          await get().fetchContacts();
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
        }
      },

      deleteContact: async (id) => {
        set({ loading: true, error: null });
        try {
          await deleteContact(id);
          await get().fetchContacts();
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
        }
      },

      logInteraction: async (interaction) => {
        set({ loading: true, error: null });
        try {
          await logInteraction(interaction);
          await get().fetchContacts();
          await get().fetchInteractions(interaction.contactId);
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
        }
      },

      setSelectedContact: (contact) => {
        set({ selectedContact: contact });
      },

      fetchContacts: async () => {
        set({ loading: true, error: null });
        try {
          await initDatabase();
          const contacts = await getContacts();
          const currentDate = new Date();

          set({
            contacts,
            overdueContacts: getOverdueContacts(contacts, currentDate),
            upcomingReminders: contacts.filter(contact => {
              const daysSinceLastContact = Math.floor(
                (currentDate.getTime() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24)
              );
              return daysSinceLastContact <= contact.frequency;
            }),
            loading: false,
          });
        } catch (error: any) {
          set({ loading: false, error: error.message });
        }
      },

      fetchInteractions: async (contactId) => {
        set({ loading: true, error: null });
        try {
          const interactions = await getInteractionsByContact(contactId);
          set({ interactions, loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
        }
      },
    }),
    {
      name: 'contact-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        contacts: state.contacts,
        selectedContact: state.selectedContact,
      }),
    }
  )
);
