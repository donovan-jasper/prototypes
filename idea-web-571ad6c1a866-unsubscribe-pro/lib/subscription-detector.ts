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

const TRANSACTIONAL_KEYWORDS = [
  'order', 'confirmation', 'receipt', 'invoice', 'tracking',
  'shipment', 'delivery', 'return', 'refund', 'payment'
];

const NEWSLETTER_KEYWORDS = [
  'newsletter', 'digest', 'weekly', 'monthly', 'update', 'summary'
];

const SERVICE_NOTIFICATION_KEYWORDS = [
  'notification', 'update', 'maintenance', 'alert', 'warning',
  'security', 'privacy', 'policy', 'change', 'announcement'
];

const SPAM_DOMAINS = new Set([
  'spamdomain.com', 'phishing.net', 'fake-service.org',
  'dodgy-email.biz', 'scam-site.co', 'shady-deals.info'
]);

async function isKnownSpamDomain(domain: string): Promise<boolean> {
  // In a real implementation, this would check against a database or API
  return SPAM_DOMAINS.has(domain.toLowerCase());
}

function hasPromotionalHtmlStructure(html: string): boolean {
  // Check for common promotional HTML patterns
  const lowerHtml = html.toLowerCase();
  return lowerHtml.includes('font-family') ||
         lowerHtml.includes('background-color') ||
         lowerHtml.includes('border-radius') ||
         lowerHtml.includes('padding:') ||
         lowerHtml.includes('margin:') ||
         lowerHtml.includes('text-align:center') ||
         lowerHtml.includes('width:100%') ||
         lowerHtml.includes('table layout=fixed');
}

function containsSpamIndicators(email: Email): boolean {
  const subject = email.subject.toLowerCase();
  const body = email.body.toLowerCase();

  return SPAM_INDICATORS.some(indicator =>
    subject.includes(indicator) || body.includes(indicator)
  );
}

export async function classifyEmail(email: Email): Promise<'important' | 'promotional' | 'spam' | 'subscription' | 'transactional' | 'newsletter' | 'service-notification'> {
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

  // Check for transactional content
  if (TRANSACTIONAL_KEYWORDS.some(keyword =>
      subject.includes(keyword) || email.body.toLowerCase().includes(keyword))) {
    return 'transactional';
  }

  // Check for newsletter content
  if (NEWSLETTER_KEYWORDS.some(keyword =>
      subject.includes(keyword) || email.body.toLowerCase().includes(keyword))) {
    return 'newsletter';
  }

  // Check for service notification content
  if (SERVICE_NOTIFICATION_KEYWORDS.some(keyword =>
      subject.includes(keyword) || email.body.toLowerCase().includes(keyword))) {
    return 'service-notification';
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
  if (SUBSCRIPTION_SERVICE_KEYWORDS.some(keyword => bodyLower.includes(keyword))) {
    tags.push('subscription-service');
  }

  // Check for tracking pixels
  if (email.body.includes('src="http://tracking') ||
      email.body.includes('src="https://tracking') ||
      email.body.includes('src="http://pixel') ||
      email.body.includes('src="https://pixel')) {
    tags.push('tracking');
  }

  // Check for unsubscribe links
  if (email.body.includes('unsubscribe') ||
      email.body.includes('opt-out') ||
      email.headers['List-Unsubscribe']) {
    tags.push('unsubscribe-available');
  }

  // Check for urgency indicators
  if (email.subject.toLowerCase().includes('urgent') ||
      email.subject.toLowerCase().includes('immediate') ||
      email.subject.toLowerCase().includes('act now')) {
    tags.push('urgent');
  }

  // Check for personalization
  if (email.body.includes('Dear') ||
      email.body.includes('Hi') ||
      email.body.includes('Hello')) {
    tags.push('personalized');
  }

  return tags;
}

export async function calculateSenderStats(emails: Email[]): Promise<Record<string, {
  count: number;
  lastEmailDate: string;
  classification: string;
  tags: string[];
}>> {
  const senderStats: Record<string, {
    count: number;
    lastEmailDate: string;
    classification: string;
    tags: string[];
  }> = {};

  for (const email of emails) {
    const domain = email.from.split('@')[1];
    if (!senderStats[domain]) {
      senderStats[domain] = {
        count: 0,
        lastEmailDate: email.date,
        classification: await classifyEmail(email),
        tags: await getAITags(email)
      };
    }

    senderStats[domain].count++;
    if (new Date(email.date) > new Date(senderStats[domain].lastEmailDate)) {
      senderStats[domain].lastEmailDate = email.date;
    }
  }

  return senderStats;
}
