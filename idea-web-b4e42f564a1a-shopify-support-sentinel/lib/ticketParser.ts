import { ParsedTicket } from './types';

const COMPANY_DOMAINS: Record<string, string> = {
  'amazon': 'Amazon',
  'shopify': 'Shopify',
  'paypal': 'PayPal',
  'apple': 'Apple',
  'microsoft': 'Microsoft',
  'google': 'Google',
  'netflix': 'Netflix',
  'uber': 'Uber',
  'doordash': 'DoorDash',
  'adobe': 'Adobe'
};

const DATE_PATTERNS = [
  // Common date formats
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
  /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  /(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{1,2}),?\s(\d{4})/i,
  /(\d{1,2})\s(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})/i,
  // With time
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s(at\s)?(\d{1,2}):(\d{2})\s?(AM|PM)?/i,
  /(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{1,2}),?\s(\d{4})\s(at\s)?(\d{1,2}):(\d{2})\s?(AM|PM)?/i
];

const TICKET_ID_PATTERNS = [
  // Common ticket ID patterns
  /(?:ticket|case|request|issue|support)\s*(?:id|#|number|:)?\s*([A-Z0-9\-]+)/i,
  /#([A-Z0-9\-]+)/i,
  /([A-Z]{2,4}\-\d{3,6})/i,
  /(\d{5,8})/i
];

export function parseTicketFromText(text: string): ParsedTicket {
  const result: ParsedTicket = {};

  // Extract company from domain
  const domainMatch = text.match(/([a-zA-Z0-9\-]+\.[a-zA-Z]{2,3})/);
  if (domainMatch) {
    const domain = domainMatch[1].split('.')[0].toLowerCase();
    if (COMPANY_DOMAINS[domain]) {
      result.company = {
        value: COMPANY_DOMAINS[domain],
        confidence: 0.9
      };
    }
  }

  // Extract ticket ID
  for (const pattern of TICKET_ID_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.ticketId = {
        value: match[1],
        confidence: 0.85
      };
      break;
    }
  }

  // Extract date
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      try {
        let day, month, year, hours = 0, minutes = 0;

        // Handle different date formats
        if (match[1].match(/^\d+$/)) {
          // Numeric date (MM/DD/YYYY or DD/MM/YYYY)
          day = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          year = parseInt(match[3]) > 1000 ? parseInt(match[3]) : 2000 + parseInt(match[3]);

          // Check if month is likely to be day (US vs international format)
          if (month > 11 && day <= 12) {
            // Likely US format (MM/DD/YYYY)
            [day, month] = [month, day - 1];
          }
        } else {
          // Month name format
          month = new Date(Date.parse(match[1] + " 1, 2023")).getMonth();
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        }

        // Handle time if present
        if (match[5] && match[6]) {
          hours = parseInt(match[5]);
          minutes = parseInt(match[6]);

          if (match[7] && match[7].toLowerCase() === 'pm' && hours < 12) {
            hours += 12;
          } else if (match[7] && match[7].toLowerCase() === 'am' && hours === 12) {
            hours = 0;
          }
        }

        const date = new Date(year, month, day, hours, minutes);
        if (!isNaN(date.getTime())) {
          result.submittedAt = {
            value: date,
            confidence: 0.8
          };
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }

  return result;
}
