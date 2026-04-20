import { useState } from 'react';
import { fetchEmails } from '../lib/email-client';
import { classifyEmail } from '../lib/subscription-detector';
import { Email } from '../types';

interface ScanResult {
  totalEmails: number;
  importantCount: number;
  promotionalCount: number;
  spamCount: number;
  subscriptionCount: number;
  senders: {
    [key: string]: {
      name: string;
      email: string;
      count: number;
      classification: 'important' | 'promotional' | 'spam' | 'subscription';
    };
  };
}

export const useEmailScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanInbox = async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Fetch emails from the inbox
      const emails = await fetchEmails();

      // Initialize counters
      const result: ScanResult = {
        totalEmails: emails.length,
        importantCount: 0,
        promotionalCount: 0,
        spamCount: 0,
        subscriptionCount: 0,
        senders: {},
      };

      // Process each email
      for (const email of emails) {
        const classification = await classifyEmail(email);

        // Update classification counts
        switch (classification) {
          case 'important':
            result.importantCount++;
            break;
          case 'promotional':
            result.promotionalCount++;
            break;
          case 'spam':
            result.spamCount++;
            break;
          case 'subscription':
            result.subscriptionCount++;
            break;
        }

        // Group by sender
        const senderEmail = email.from.split('<').pop()?.split('>')[0] || email.from;
        const senderName = email.from.split('<')[0].trim() || senderEmail;

        if (!result.senders[senderEmail]) {
          result.senders[senderEmail] = {
            name: senderName,
            email: senderEmail,
            count: 0,
            classification: classification,
          };
        }

        result.senders[senderEmail].count++;
      }

      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan inbox');
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    scanResult,
    error,
    scanInbox,
  };
};
