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
  if (NEWSLETTER_KEYWORDS.some(keyword =>
      subjectLower.includes(keyword) || bodyLower.includes(keyword))) {
    tags.push('newsletter');
  }

  // Check for marketing campaigns
  if (subjectLower.includes('campaign') ||
      subjectLower.includes('promo') ||
      subjectLower.includes('special offer')) {
    tags.push('marketing-campaign');
  }

  // Check for service notifications
  if (SERVICE_NOTIFICATION_KEYWORDS.some(keyword =>
      subjectLower.includes(keyword) || bodyLower.includes(keyword))) {
    tags.push('service-notification');
  }

  // Check for transactional emails
  if (TRANSACTIONAL_KEYWORDS.some(keyword =>
      subjectLower.includes(keyword) || bodyLower.includes(keyword))) {
    tags.push('transactional');
  }

  // Check for spam indicators
  if (containsSpamIndicators(email)) {
    tags.push('spam');
  }

  // Check for high-priority emails
  if (email.headers['X-Priority'] === '1' ||
      email.headers['Importance'] === 'high' ||
      email.headers['Precedence'] === 'urgent') {
    tags.push('high-priority');
  }

  return tags;
}
