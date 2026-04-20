import { Email } from '../types';

export function parseEmail(email: Email): Email {
  // Extract unsubscribe links
  const unsubscribeLinks = extractUnsubscribeLinks(email);

  // Add unsubscribe-available tag if links are found
  if (unsubscribeLinks.length > 0) {
    email.tags.push('unsubscribe-available');
  }

  // Detect tracking pixels
  if (containsTrackingPixels(email.body)) {
    email.tags.push('tracking');
  }

  // Detect urgent/important flags
  if (isUrgentEmail(email)) {
    email.tags.push('urgent');
  }

  return email;
}

export function extractUnsubscribeLinks(email: Email): string[] {
  const links: string[] = [];

  // Check List-Unsubscribe header
  if (email.headers['List-Unsubscribe']) {
    const headerValue = email.headers['List-Unsubscribe'];
    const matches = headerValue.match(/<([^>]+)>/g);
    if (matches) {
      links.push(...matches.map(match => match.slice(1, -1)));
    }
  }

  // Check for unsubscribe links in the body
  const bodyLinks = extractLinksFromHtml(email.body);
  const unsubscribeLinks = bodyLinks.filter(link =>
    link.text.toLowerCase().includes('unsubscribe') ||
    link.href.toLowerCase().includes('unsubscribe') ||
    link.href.toLowerCase().includes('optout')
  );

  links.push(...unsubscribeLinks.map(link => link.href));

  return [...new Set(links)]; // Remove duplicates
}

function extractLinksFromHtml(html: string): { href: string; text: string }[] {
  const links: { href: string; text: string }[] = [];
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[2];
    const text = match[3].replace(/<[^>]*>/g, '').trim();
    links.push({ href, text });
  }

  return links;
}

function containsTrackingPixels(html: string): boolean {
  const trackingPatterns = [
    /src=["'][^"']*tracking[^"']*["']/i,
    /src=["'][^"']*pixel[^"']*["']/i,
    /src=["'][^"']*1x1[^"']*["']/i,
    /src=["'][^"']*webtrends[^"']*["']/i,
    /src=["'][^"']*google-analytics[^"']*["']/i,
    /src=["'][^"']*adobe-analytics[^"']*["']/i
  ];

  return trackingPatterns.some(pattern => pattern.test(html));
}

function isUrgentEmail(email: Email): boolean {
  // Check headers for urgency indicators
  if (email.headers['X-Priority'] === '1' ||
      email.headers['Importance'] === 'high' ||
      email.headers['Precedence'] === 'urgent') {
    return true;
  }

  // Check subject for urgency keywords
  const subject = email.subject.toLowerCase();
  const urgencyKeywords = [
    'urgent', 'immediate', 'action required', 'required', 'asap',
    'today only', 'limited time', 'exclusive', 'special offer'
  ];

  return urgencyKeywords.some(keyword => subject.includes(keyword));
}

export function extractEmailMetadata(email: Email): {
  from: string;
  domain: string;
  subject: string;
  date: Date;
  hasUnsubscribe: boolean;
  isTracking: boolean;
  isUrgent: boolean;
} {
  const unsubscribeLinks = extractUnsubscribeLinks(email);
  const isTracking = containsTrackingPixels(email.body);
  const isUrgent = isUrgentEmail(email);

  return {
    from: email.from,
    domain: email.from.split('@')[1] || 'unknown',
    subject: email.subject,
    date: new Date(email.date),
    hasUnsubscribe: unsubscribeLinks.length > 0,
    isTracking,
    isUrgent
  };
}
