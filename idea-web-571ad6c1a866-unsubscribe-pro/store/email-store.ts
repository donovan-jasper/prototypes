import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Email, Sender } from '../types';
import { getSenders, getEmailsBySender, saveEmails, markEmailAsUnsubscribed, addToUnsubscribeQueue } from '../lib/database';
import { classifyEmail, getAITags, calculateSenderStats } from '../lib/subscription-detector';
import { EmailClient } from '../lib/email-client';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

interface EmailState {
  emails: Email[];
  senders: Sender[];
  isLoading: boolean;
  error: string | null;
  emailClient: EmailClient | null;
  setEmailClient: (client: EmailClient) => void;
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
      emailClient: null,

      setEmailClient: (client) => set({ emailClient: client }),

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
          const client = get().emailClient;

          if (!client) {
            throw new Error('Email client not initialized');
          }

          // Fetch real emails from the provider
          const emails = await client.fetchEmails(50);

          // Classify and tag emails
          const classifiedEmails = await Promise.all(emails.map(async email => ({
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
            id: domain,
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
          const client = get().emailClient;

          if (!client) {
            throw new Error('Email client not initialized');
          }

          // Get all emails from this sender
          const emails = await getEmailsBySender(domain);

          // Find the most recent email with unsubscribe info
          const emailWithUnsubscribe = emails.find(email =>
            email.headers['List-Unsubscribe'] ||
            email.body.includes('unsubscribe') ||
            email.body.includes('Unsubscribe')
          );

          if (!emailWithUnsubscribe) {
            throw new Error('No unsubscribe information found for this sender');
          }

          // Extract unsubscribe link
          let unsubscribeLink = '';
          if (emailWithUnsubscribe.headers['List-Unsubscribe']) {
            // Parse List-Unsubscribe header
            const header = emailWithUnsubscribe.headers['List-Unsubscribe'];
            const match = header.match(/<([^>]+)>/);
            if (match) {
              unsubscribeLink = match[1];
            }
          } else {
            // Try to find unsubscribe link in body
            const body = emailWithUnsubscribe.body;
            const linkMatch = body.match(/(https?:\/\/[^\s"']+)/);
            if (linkMatch) {
              unsubscribeLink = linkMatch[0];
            }
          }

          if (!unsubscribeLink) {
            throw new Error('Could not find unsubscribe link');
          }

          // Execute unsubscribe link via email client
          try {
            await Linking.openURL(unsubscribeLink);

            // Mark emails as unsubscribed in database
            await markEmailAsUnsubscribed(domain);

            // Update sender stats
            const updatedSenders = get().senders.map(sender =>
              sender.domain === domain
                ? { ...sender, emailCount: 0, unsubscribed: true }
                : sender
            );
            set({ senders: updatedSenders });

            // Show success feedback
            Alert.alert(
              'Success',
              'You have been unsubscribed from this sender',
              [{ text: 'OK' }]
            );

            // Trigger haptic feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          } catch (error) {
            console.error('Error opening unsubscribe link:', error);

            // If offline, add to queue
            if (error.message.includes('Network request failed')) {
              await addToUnsubscribeQueue({
                emailId: emailWithUnsubscribe.id,
                domain,
                actionType: 'unsubscribe',
                status: 'pending'
              });

              Alert.alert(
                'Offline',
                'Action saved for when you\'re back online',
                [{ text: 'OK' }]
              );
            } else {
              throw error;
            }
          }

          set({ isLoading: false });
        } catch (error) {
          set({ error: error.message || 'Failed to unsubscribe', isLoading: false });
          console.error('Unsubscribe error:', error);

          // Show error feedback
          Alert.alert(
            'Error',
            error.message || 'Failed to unsubscribe',
            [{ text: 'OK' }]
          );

          // Trigger haptic feedback for error
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      },

      markEmailAsProcessed: async (emailId: string) => {
        try {
          await markEmailAsUnsubscribed(emailId);
          const updatedEmails = get().emails.map(email =>
            email.id === emailId ? { ...email, processed: true } : email
          );
          set({ emails: updatedEmails });
        } catch (error) {
          console.error('Failed to mark email as processed:', error);
        }
      }
    }),
    {
      name: 'email-storage',
      getStorage: () => require('expo-secure-store').default,
    }
  )
);
