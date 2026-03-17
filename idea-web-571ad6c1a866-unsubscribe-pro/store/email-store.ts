import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Email } from '../types';

interface EmailState {
  emails: Email[];
  setEmails: (emails: Email[]) => void;
  addEmail: (email: Email) => void;
  removeEmail: (id: string) => void;
}

export const useEmailStore = create<EmailState>()(
  persist(
    (set) => ({
      emails: [],
      setEmails: (emails) => set({ emails }),
      addEmail: (email) => set((state) => ({ emails: [...state.emails, email] })),
      removeEmail: (id) => set((state) => ({
        emails: state.emails.filter((email) => email.id !== id)
      })),
    }),
    {
      name: 'email-storage',
    }
  )
);
