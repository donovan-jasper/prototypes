import { Email } from '../types';

const PROMOTIONAL_KEYWORDS = [
  'subscribe', 'offer', 'discount', 'sale', 'promo', 'newsletter',
  'limited time', 'exclusive', 'free trial', 'special offer'
];

const IMPORTANT_KEYWORDS = [
  'invoice', 'receipt', 'confirmation', 'appointment', 'meeting',
  'reminder', 'alert', 'update', 'notification'
];

const SUBSCRIPTION_KEYWORDS = [
  'subscription', 'renewal', 'billing', 'payment', 'invoice',
  'receipt', 'order confirmation', 'auto-renew', 'cancel subscription'
];

const SUBSCRIPTION_SERVICE_KEYWORDS = [
  'netflix', 'spotify', 'amazon', 'apple', 'google', 'microsoft',
  'disney', 'hulu', 'prime', 'adobe', 'dropbox', 'zoom', 'slack'
];

export async function classifyEmail(email: Email): Promise<'important' | 'promotional' | 'spam' | 'subscription'> {
  // Check headers first
  if (email.headers['X-Priority'] === '1' || email.headers['Importance'] === 'high') {
    return 'important';
  }

  // Check subject line
  const subject = email.subject.toLowerCase();
  if (IMPORTANT_KEYWORDS.some(keyword => subject.includes(keyword))) {
    return 'important';
  }

  if (SUBSCRIPTION_KEYWORDS.some(keyword => subject.includes(keyword) ||
      email.body.toLowerCase().includes(keyword))) {
    return 'subscription';
  }

  if (PROMOTIONAL_KEYWORDS.some(keyword => subject.includes(keyword))) {
    return 'promotional';
  }

  // Check sender domain
  const senderDomain = email.from.split('@')[1];
  if (isKnownSpamDomain(senderDomain)) {
    return 'spam';
  }

  // Default to promotional if we can't classify
  return 'promotional';
}

export async function getAITags(email: Email): Promise<string[]> {
  const tags: string[] = [];

  // Check for subscription services
  const bodyLower = email.body.toLowerCase();
  const subjectLower = email.subject.toLowerCase();

  if (SUBSCRIPTION_SERVICE_KEYWORDS.some(keyword =>
      bodyLower.includes(keyword) || subjectLower.includes(keyword))) {
    tags.push('subscription-service');
  }

  // Check for payment receipts
  if (subjectLower.includes('receipt') ||
      subjectLower.includes('invoice') ||
      bodyLower.includes('payment confirmation') ||
      bodyLower.includes('billing statement')) {
    tags.push('subscription');
  }

  // Check for important emails
  if (IMPORTANT_KEYWORDS.some(keyword =>
      subjectLower.includes(keyword) || bodyLower.includes(keyword))) {
    tags.push('important');
  }

  // Check for promotional content
  if (PROMOTIONAL_KEYWORDS.some(keyword =>
      subjectLower.includes(keyword) || bodyLower.includes(keyword))) {
    tags.push('promotional');
  }

  // Check for newsletters
  if (subjectLower.includes('newsletter') ||
      subjectLower.includes('digest') ||
      bodyLower.includes('weekly update') ||
      bodyLower.includes('monthly digest')) {
    tags.push('newsletter');
  }

  // Check for marketing campaigns
  if (subjectLower.includes('campaign') ||
      subjectLower.includes('promotion') ||
      bodyLower.includes('special offer') ||
      bodyLower.includes('limited time')) {
    tags.push('marketing');
  }

  // Check for service notifications
  if (subjectLower.includes('notification') ||
      subjectLower.includes('update') ||
      bodyLower.includes('service update') ||
      bodyLower.includes('maintenance notice')) {
    tags.push('service-notification');
  }

  return [...new Set(tags)]; // Remove duplicates
}

function isKnownSpamDomain(domain: string): boolean {
  const spamDomains = [
    'spam.com', 'fake.com', 'phishing.net', 'scam.org',
    'dodgy.biz', 'untrustworthy.co'
  ];
  return spamDomains.includes(domain);
}
