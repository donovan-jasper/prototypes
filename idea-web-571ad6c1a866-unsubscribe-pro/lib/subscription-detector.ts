import { Email } from '../types';

const PROMOTIONAL_KEYWORDS = [
  'subscribe', 'offer', 'discount', 'sale', 'promo', 'newsletter',
  'limited time', 'exclusive', 'free trial', 'special offer'
];

const IMPORTANT_KEYWORDS = [
  'invoice', 'receipt', 'confirmation', 'appointment', 'meeting',
  'reminder', 'alert', 'update', 'notification'
];

export async function classifyEmail(email: Email): Promise<'important' | 'promotional' | 'spam'> {
  // Check headers first
  if (email.headers['X-Priority'] === '1' || email.headers['Importance'] === 'high') {
    return 'important';
  }

  // Check subject line
  const subject = email.subject.toLowerCase();
  if (IMPORTANT_KEYWORDS.some(keyword => subject.includes(keyword))) {
    return 'important';
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

function isKnownSpamDomain(domain: string): boolean {
  const spamDomains = [
    'spam.com', 'fake.com', 'phishing.net', 'scam.org',
    'dodgy.biz', 'untrustworthy.co'
  ];
  return spamDomains.includes(domain);
}
