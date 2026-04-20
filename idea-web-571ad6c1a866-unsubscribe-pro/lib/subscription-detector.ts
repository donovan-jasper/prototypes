import { Email } from '../types';

const PROMOTIONAL_KEYWORDS = [
  'subscribe', 'offer', 'discount', 'sale', 'promo', 'newsletter',
  'limited time', 'exclusive', 'free trial', 'special offer',
  'click here', 'limited offer', 'act now', 'urgent', 'exclusive deal'
];

const IMPORTANT_KEYWORDS = [
  'invoice', 'receipt', 'confirmation', 'appointment', 'meeting',
  'reminder', 'alert', 'update', 'notification', 'important',
  'urgent', 'action required', 'required', 'immediate attention'
];

const SUBSCRIPTION_KEYWORDS = [
  'subscription', 'renewal', 'billing', 'payment', 'invoice',
  'receipt', 'order confirmation', 'auto-renew', 'cancel subscription',
  'membership', 'plan', 'trial', 'free', 'trial ends'
];

const SUBSCRIPTION_SERVICE_KEYWORDS = [
  'netflix', 'spotify', 'amazon', 'apple', 'google', 'microsoft',
  'disney', 'hulu', 'prime', 'adobe', 'dropbox', 'zoom', 'slack',
  'github', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube'
];

const SPAM_INDICATORS = [
  'viagra', 'pills', 'medication', 'weight loss', 'cash bonus',
  'guaranteed', '100% free', 'no cost', 'act now', 'limited time',
  'urgent', 'click here', 'exclusive deal', 'offer you can\'t refuse'
];

export async function classifyEmail(email: Email): Promise<'important' | 'promotional' | 'spam' | 'subscription'> {
  // Check for spam indicators first
  if (containsSpamIndicators(email)) {
    return 'spam';
  }

  // Check headers for priority flags
  if (email.headers['X-Priority'] === '1' ||
      email.headers['Importance'] === 'high' ||
      email.headers['Precedence'] === 'urgent') {
    return 'important';
  }

  // Check for list-unsubscribe header
  if (email.headers['List-Unsubscribe']) {
    return 'promotional';
  }

  // Check subject line for important keywords
  const subject = email.subject.toLowerCase();
  if (IMPORTANT_KEYWORDS.some(keyword => subject.includes(keyword))) {
    return 'important';
  }

  // Check for subscription-related content
  if (SUBSCRIPTION_KEYWORDS.some(keyword =>
      subject.includes(keyword) || email.body.toLowerCase().includes(keyword))) {
    return 'subscription';
  }

  // Check for promotional content
  if (PROMOTIONAL_KEYWORDS.some(keyword =>
      subject.includes(keyword) || email.body.toLowerCase().includes(keyword))) {
    return 'promotional';
  }

  // Check sender domain reputation
  const senderDomain = email.from.split('@')[1];
  if (await isKnownSpamDomain(senderDomain)) {
    return 'spam';
  }

  // Check for HTML structure patterns
  if (hasPromotionalHtmlStructure(email.body)) {
    return 'promotional';
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

  // Check for spam indicators
  if (containsSpamIndicators(email)) {
    tags.push('spam');
  }

  // Check for transactional emails
  if (subjectLower.includes('order') ||
      subjectLower.includes('confirmation') ||
      bodyLower.includes('order details') ||
      bodyLower.includes('tracking number')) {
    tags.push('transactional');
  }

  return [...new Set(tags)]; // Remove duplicates
}

function containsSpamIndicators(email: Email): boolean {
  const content = `${email.subject} ${email.body}`.toLowerCase();
  return SPAM_INDICATORS.some(indicator => content.includes(indicator));
}

async function isKnownSpamDomain(domain: string): Promise<boolean> {
  // In a real implementation, this would query a domain reputation database
  // For this prototype, we'll use a simple list
  const spamDomains = [
    'spam.com', 'fake.com', 'phishing.net', 'scam.org',
    'dodgy.biz', 'untrustworthy.co', 'dodgymail.com',
    'spamdomain.net', 'phishingsite.org', 'fakeemail.com'
  ];

  // Also check if domain is from a known free email provider
  const freeEmailProviders = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'aol.com', 'protonmail.com', 'icloud.com'
  ];

  // If domain is from a free provider but has suspicious patterns
  if (freeEmailProviders.includes(domain) &&
      (email.subject.toLowerCase().includes('urgent') ||
       email.subject.toLowerCase().includes('important'))) {
    return true;
  }

  return spamDomains.includes(domain);
}

function hasPromotionalHtmlStructure(html: string): boolean {
  // Check for common promotional HTML patterns
  const promotionalPatterns = [
    /<table[^>]*width="100%"/i,
    /<div[^>]*style="[^"]*background-color[^"]*"/i,
    /<a[^>]*href="[^"]*track[^"]*"/i,
    /<img[^>]*src="[^"]*banner[^"]*"/i,
    /<div[^>]*class="[^"]*promo[^"]*"/i,
    /<div[^>]*style="[^"]*font-size:[^"]*large[^"]*"/i
  ];

  return promotionalPatterns.some(pattern => pattern.test(html));
}
