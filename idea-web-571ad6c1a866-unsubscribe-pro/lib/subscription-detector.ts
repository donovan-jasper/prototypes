import { Email } from '../types';

export async function classifyEmail(email: Email): Promise<string> {
  // Simple classification based on common patterns
  const subject = email.subject.toLowerCase();
  const body = email.body.toLowerCase();
  const headers = email.headers;

  // Check for transactional emails
  if (subject.includes('order') ||
      subject.includes('receipt') ||
      subject.includes('confirmation') ||
      subject.includes('invoice') ||
      subject.includes('shipped')) {
    return 'transactional';
  }

  // Check for service notifications
  if (subject.includes('account') ||
      subject.includes('update') ||
      subject.includes('security') ||
      subject.includes('verification')) {
    return 'service-notification';
  }

  // Check for newsletters
  if (subject.includes('newsletter') ||
      subject.includes('weekly') ||
      subject.includes('monthly') ||
      subject.includes('digest')) {
    return 'newsletter';
  }

  // Check for promotional emails
  if (subject.includes('offer') ||
      subject.includes('discount') ||
      subject.includes('sale') ||
      subject.includes('promo') ||
      subject.includes('exclusive') ||
      subject.includes('limited time')) {
    return 'promotional';
  }

  // Check for spam patterns
  if (subject.includes('viagra') ||
      subject.includes('loan') ||
      subject.includes('free') ||
      subject.includes('win') ||
      subject.includes('congratulations') ||
      subject.includes('urgent')) {
    return 'spam';
  }

  // Default classification
  return 'unknown';
}

export async function getAITags(email: Email): Promise<string[]> {
  const tags: string[] = [];

  // Check for unsubscribe links
  if (email.headers['List-Unsubscribe'] ||
      email.body.includes('unsubscribe') ||
      email.body.includes('Unsubscribe')) {
    tags.push('unsubscribe-available');
  }

  // Check for tracking pixels
  if (email.body.includes('tracking') ||
      email.body.includes('web beacon') ||
      email.body.includes('1x1 pixel')) {
    tags.push('tracking');
  }

  // Check for urgency indicators
  if (email.subject.includes('urgent') ||
      email.subject.includes('action required') ||
      email.subject.includes('limited time')) {
    tags.push('urgent');
  }

  // Check for subscription confirmation
  if (email.subject.includes('confirm') ||
      email.subject.includes('subscribe') ||
      email.subject.includes('welcome')) {
    tags.push('subscription-confirmation');
  }

  return tags;
}

export async function calculateSenderStats(emails: Email[]): Promise<Record<string, {
  count: number;
  lastEmailDate: string;
  classification: string;
  tags: string[];
}>> {
  const stats: Record<string, {
    count: number;
    lastEmailDate: string;
    classification: string;
    tags: string[];
  }> = {};

  for (const email of emails) {
    const domain = email.from.split('@')[1] || 'unknown';

    if (!stats[domain]) {
      stats[domain] = {
        count: 0,
        lastEmailDate: '',
        classification: 'unknown',
        tags: []
      };
    }

    stats[domain].count++;
    if (new Date(email.date) > new Date(stats[domain].lastEmailDate)) {
      stats[domain].lastEmailDate = email.date;
    }

    // Use the most common classification for the sender
    const currentClassification = await classifyEmail(email);
    if (stats[domain].classification === 'unknown') {
      stats[domain].classification = currentClassification;
    }

    // Combine tags
    const currentTags = await getAITags(email);
    stats[domain].tags = [...new Set([...stats[domain].tags, ...currentTags])];
  }

  return stats;
}
