import { useState } from 'react';
import { useEmailStore } from '../store/email-store';
import { fetchEmails } from '../lib/email-client';
import { classifyEmail } from '../lib/subscription-detector';

export function useEmailScan() {
  const [isScanning, setIsScanning] = useState(false);
  const { emails, setEmails } = useEmailStore();

  const scanInbox = async () => {
    setIsScanning(true);
    try {
      const rawEmails = await fetchEmails();
      const classifiedEmails = await Promise.all(
        rawEmails.map(async (email) => ({
          ...email,
          category: await classifyEmail(email),
          tags: await getAITags(email),
        }))
      );
      setEmails(classifiedEmails);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getAITags = async (email: any) => {
    // In a real implementation, this would call an AI service
    // For demo purposes, we'll return mock tags
    const tags = [];

    if (email.category === 'important') {
      tags.push('work', 'urgent');
    } else if (email.category === 'promotional') {
      tags.push('marketing', 'newsletter');
    } else if (email.category === 'subscription') {
      tags.push('subscription', 'billing');
    } else {
      tags.push('potential spam');
    }

    // Add subscription tag if email appears to be a receipt
    if (email.subject.toLowerCase().includes('receipt') ||
        email.subject.toLowerCase().includes('invoice') ||
        email.body.toLowerCase().includes('payment confirmation')) {
      tags.push('subscription');
    }

    return [...new Set(tags)]; // Remove duplicates
  };

  return { isScanning, scanInbox, emails };
}
