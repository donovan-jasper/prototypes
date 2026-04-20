import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Email, Sender } from '../types';
import { getSenders, getEmailsBySender, saveEmails, markEmailAsUnsubscribed, addToUnsubscribeQueue } from '../lib/database';
import { classifyEmail, getAITags, calculateSenderStats } from '../lib/subscription-detector';

interface EmailState {
  emails: Email[];
  senders: Sender[];
  isLoading: boolean;
  error: string | null;
  setEmails: (emails: Email[]) => void;
  setSenders: (senders: Sender[]) => void;
  loadSenders: () => Promise<void>;
  loadEmailsBySender: (domain: string) => Promise<void>;
  scanInbox: () => Promise<void>;
  unsubscribeFromSender: (domain: string) => Promise<void>;
  markEmailAsProcessed: (emailId: string) => void;
}

export const useEmailStore = create<EmailState>()(
  persist(
    (set, get) => ({
      emails: [],
      senders: [],
      isLoading: false,
      error: null,

      setEmails: (emails) => set({ emails }),
      setSenders: (senders) => set({ senders }),

      loadSenders: async () => {
        try {
          set({ isLoading: true, error: null });
          const senders = await getSenders();
          set({ senders, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load senders', isLoading: false });
          console.error('Failed to load senders:', error);
        }
      },

      loadEmailsBySender: async (domain: string) => {
        try {
          set({ isLoading: true, error: null });
          const emails = await getEmailsBySender(domain);
          set({ emails, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load emails', isLoading: false });
          console.error('Failed to load emails:', error);
        }
      },

      scanInbox: async () => {
        try {
          set({ isLoading: true, error: null });

          // In a real app, this would connect to the email provider API
          // For now, we'll simulate scanning emails
          const mockEmails: Email[] = [
            {
              id: '1',
              from: 'newsletter@amazon.com',
              subject: 'Your weekly Amazon newsletter',
              body: 'Check out our latest offers and deals...',
              date: new Date(Date.now() - 86400000).toISOString(),
              headers: {
                'List-Unsubscribe': '<mailto:unsubscribe@amazon.com>'
              },
              classification: 'newsletter',
              tags: ['unsubscribe-available']
            },
            {
              id: '2',
              from: 'support@netflix.com',
              subject: 'Your Netflix account update',
              body: 'Your subscription will renew on...',
              date: new Date(Date.now() - 172800000).toISOString(),
              headers: {
                'X-Priority': '1'
              },
              classification: 'service-notification',
              tags: []
            },
            {
              id: '3',
              from: 'orders@amazon.com',
              subject: 'Your order #12345 has shipped',
              body: 'Your package is on its way...',
              date: new Date(Date.now() - 259200000).toISOString(),
              headers: {},
              classification: 'transactional',
              tags: []
            },
            {
              id: '4',
              from: 'promo@bestbuy.com',
              subject: 'Exclusive deal just for you!',
              body: 'Click here to claim your discount...',
              date: new Date(Date.now() - 345600000).toISOString(),
              headers: {
                'List-Unsubscribe': '<mailto:unsubscribe@bestbuy.com>'
              },
              classification: 'promotional',
              tags: ['unsubscribe-available', 'urgent']
            },
            {
              id: '5',
              from: 'spam@fakepharmacy.com',
              subject: 'VIAGRA - 100% GUARANTEED!',
              body: 'Order now and get 50% off...',
              date: new Date(Date.now() - 432000000).toISOString(),
              headers: {},
              classification: 'spam',
              tags: ['tracking']
            }
          ];

          // Classify and tag emails
          const classifiedEmails = await Promise.all(mockEmails.map(async email => ({
            ...email,
            classification: await classifyEmail(email),
            tags: await getAITags(email)
          })));

          // Save to database
          await saveEmails(classifiedEmails);

          // Calculate sender stats
          const senderStats = await calculateSenderStats(classifiedEmails);

          // Convert to Sender objects
          const senders: Sender[] = Object.entries(senderStats).map(([domain, stats]) => ({
            id: domain, // Using domain as ID for simplicity
            domain,
            name: domain,
            emailCount: stats.count,
            lastEmailDate: stats.lastEmailDate,
            classification: stats.classification,
            tags: stats.tags
          }));

          set({ emails: classifiedEmails, senders, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to scan inbox', isLoading: false });
          console.error('Failed to scan inbox:', error);
        }
      },

      unsubscribeFromSender: async (domain: string) => {
        try {
          set({ isLoading: true, error: null });

          // Get all emails from this sender
          const emails = await getEmailsBySender(domain);

          // For each email, add to unsubscribe queue
          for (const email of emails) {
            await addToUnsubscribeQueue(email.id, 'unsubscribe');
            await markEmailAsUnsubscribed(email.id);
          }

          // Update sender stats
          const updatedSenders = get().senders.map(sender =>
            sender.domain === domain
              ? { ...sender, emailCount: 0, classification: 'unsubscribed' }
              : sender
          );

          set({ senders: updatedSenders, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to unsubscribe', isLoading: false });
          console.error('Failed to unsubscribe:', error);
        }
      },

      markEmailAsProcessed: (emailId: string) => {
        set(state => ({
          emails: state.emails.map(email =>
            email.id === emailId ? { ...email, processed: true } : email
          )
        }));
      }
    }),
    {
      name: 'email-storage',
      partialize: (state) => ({
        senders: state.senders,
        // Don't persist emails to avoid large storage
      }),
    }
  )
);
