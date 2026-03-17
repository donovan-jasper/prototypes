import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Email, Sender } from '../types';

interface EmailState {
  emails: Email[];
  senders: Sender[];
  setEmails: (emails: Email[]) => void;
  setSenders: (senders: Sender[]) => void;
  addEmail: (email: Email) => void;
  removeEmail: (id: string) => void;
  updateSenderTags: (senderId: string, tags: string[]) => void;
}

export const useEmailStore = create<EmailState>()(
  persist(
    (set) => ({
      emails: [],
      senders: [],
      setEmails: (emails) => set({ emails }),
      setSenders: (senders) => set({ senders }),
      addEmail: (email) => set((state) => ({ emails: [...state.emails, email] })),
      removeEmail: (id) => set((state) => ({
        emails: state.emails.filter((email) => email.id !== id)
      })),
      updateSenderTags: (senderId, tags) => set((state) => ({
        senders: state.senders.map(sender =>
          sender.id === senderId ? { ...sender, tags } : sender
        )
      })),
    }),
    {
      name: 'email-storage',
    }
  )
);
