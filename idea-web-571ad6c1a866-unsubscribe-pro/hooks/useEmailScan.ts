import { useState } from 'react';
import { useEmailStore } from '../store/email-store';
import { fetchEmails } from '../lib/email-client';
import { classifyEmail, getAITags } from '../lib/subscription-detector';
import { Sender } from '../types';

export function useEmailScan() {
  const [isScanning, setIsScanning] = useState(false);
  const { emails, senders, setEmails, setSenders } = useEmailStore();

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

      // Group emails by sender
      const senderMap: Record<string, Sender> = {};

      classifiedEmails.forEach(email => {
        const domain = email.from.split('@')[1];
        const senderId = domain;

        if (!senderMap[senderId]) {
          senderMap[senderId] = {
            id: senderId,
            name: domain,
            domain: domain,
            emailCount: 0,
            lastEmailDate: email.date,
            category: email.category,
            tags: email.tags || [],
          };
        }

        senderMap[senderId].emailCount++;
        if (new Date(email.date) > new Date(senderMap[senderId].lastEmailDate)) {
          senderMap[senderId].lastEmailDate = email.date;
        }

        // Merge tags from all emails from this sender
        if (email.tags) {
          senderMap[senderId].tags = [
            ...new Set([...senderMap[senderId].tags || [], ...email.tags])
          ];
        }
      });

      const sendersList = Object.values(senderMap).sort((a, b) =>
        b.emailCount - a.emailCount
      );

      setEmails(classifiedEmails);
      setSenders(sendersList);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return { isScanning, scanInbox, emails, senders };
}
