import { useState } from 'react';
import { Alert } from 'react-native';
import { useEmailStore } from '../store/email-store';
import { useUserStore } from '../store/user-store';
import { EmailClient } from '../lib/email-client';
import { markEmailAsUnsubscribed, addToUnsubscribeQueue, incrementUnsubscribeCount } from '../lib/database';

export const useUnsubscribe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, incrementUnsubscribes } = useUserStore();
  const { loadSenders } = useEmailStore();

  const unsubscribe = async (domain: string) => {
    setIsLoading(true);

    try {
      // In a real app, you would use the appropriate client based on the user's provider
      const emailClient = new EmailClient(user.provider, '');

      // For demo purposes, we'll use mock data
      const mockEmail = {
        id: 'mock-email-id',
        from: `user@${domain}`,
        subject: 'Unsubscribe request',
        body: 'Please unsubscribe me from your emails',
        date: new Date().toISOString(),
        headers: {
          'List-Unsubscribe': `<mailto:unsubscribe@${domain}>`
        },
        classification: 'promotional',
        tags: ['unsubscribe-available']
      };

      // Try to unsubscribe immediately
      const success = await emailClient.unsubscribe(mockEmail);

      if (success) {
        // Mark email as unsubscribed in database
        await markEmailAsUnsubscribed(mockEmail.id);

        // Increment unsubscribe count
        const newCount = await incrementUnsubscribeCount();
        incrementUnsubscribes(newCount);

        // Refresh sender list
        await loadSenders();

        Alert.alert('Success', `Successfully unsubscribed from ${domain}`);
      } else {
        // If immediate unsubscribe fails, add to queue for later processing
        await addToUnsubscribeQueue(mockEmail.id, domain, 'unsubscribe');
        Alert.alert('Queued', `Unsubscribe request queued for ${domain}`);
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      Alert.alert('Error', 'Failed to unsubscribe. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return { unsubscribe, isLoading };
};
