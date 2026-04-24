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
  'adobe': 'Adobe',
  'zendesk': 'Zendesk',
  'intercom': 'Intercom',
  'salesforce': 'Salesforce',
  'stripe': 'Stripe',
  'twilio': 'Twilio',
  'dropbox': 'Dropbox',
  'slack': 'Slack',
  'zoom': 'Zoom',
  'atlassian': 'Atlassian',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'bitbucket': 'Bitbucket',
  'trello': 'Trello',
  'asana': 'Asana',
  'notion': 'Notion',
  'figma': 'Figma',
  'sketch': 'Sketch',
  'adobexd': 'Adobe XD',
  'invision': 'InVision',
  'mailchimp': 'Mailchimp',
  'constantcontact': 'Constant Contact',
  'hubspot': 'HubSpot',
  'marketo': 'Marketo',
  'salesloft': 'SalesLoft',
  'braintree': 'Braintree',
  'square': 'Square',
  'venmo': 'Venmo',
  'cashapp': 'Cash App',
  'robinhood': 'Robinhood',
  'coinbase': 'Coinbase',
  'kraken': 'Kraken',
  'binance': 'Binance',
  'payoneer': 'Payoneer',
  'wise': 'Wise',
  'revolut': 'Revolut',
  'chase': 'Chase',
  'bankofamerica': 'Bank of America',
  'wellsfargo': 'Wells Fargo',
  'citibank': 'Citi Bank',
  'usbank': 'US Bank',
  'capitalone': 'Capital One',
  'americanexpress': 'American Express',
  'discover': 'Discover',
  'bofa': 'Bank of America',
  'chaseonline': 'Chase',
  'wellsfargomobile': 'Wells Fargo',
  'citibankonline': 'Citi Bank',
  'usbankmobile': 'US Bank',
  'capitalonemobile': 'Capital One',
  'amexonline': 'American Express',
  'discoveronline': 'Discover'
};

const DATE_PATTERNS = [
  // Common date formats
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
  /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  /(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{1,2}),?\s(\d{4})/i,
  /(\d{1,2})\s(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})/i,
  // With time
  /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s(at\s)?(\d{1,2}):(\d{2})\s?(AM|PM)?/i,
  /(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{1,2}),?\s(\d{4})\s(at\s)?(\d{1,2}):(\d{2})\s?(AM|PM)?/i,
  // Relative dates
  /(\d+)\s(days?|weeks?|months?|years?)\s(ago|earlier)/i,
  // Today/yesterday
  /(today|yesterday|tomorrow)/i
];

const TICKET_ID_PATTERNS = [
  // Common ticket ID patterns
  /(?:ticket|case|request|issue|support)\s*(?:id|#|number|:)?\s*([A-Z0-9\-]+)/i,
  /#([A-Z0-9\-]+)/i,
  /([A-Z]{2,4}\-\d{3,6})/i,
  /(\d{5,8})/i,
  // Common service patterns
  /(?:ref|order|transaction|invoice)\s*(?:id|#|number|:)?\s*([A-Z0-9\-]+)/i,
  /(?:order|transaction|invoice)\s*#?([A-Z0-9\-]+)/i,
  /(?:ref|reference)\s*#?([A-Z0-9\-]+)/i
];

export function parseTicketFromText(text: string): ParsedTicket {
  const result: ParsedTicket = {};
  const lowerText = text.toLowerCase();

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

  // Extract company from known service names
  if (!result.company) {
    for (const [domain, company] of Object.entries(COMPANY_DOMAINS)) {
      if (lowerText.includes(domain.toLowerCase())) {
        result.company = {
          value: company,
          confidence: 0.7
        };
        break;
      }
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
        let date: Date;

        // Handle relative dates
        if (match[1] && match[2] && match[3]) {
          const value = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          const direction = match[3].toLowerCase();

          const now = new Date();
          if (direction === 'ago') {
            if (unit.includes('day')) {
              now.setDate(now.getDate() - value);
            } else if (unit.includes('week')) {
              now.setDate(now.getDate() - value * 7);
            } else if (unit.includes('month')) {
              now.setMonth(now.getMonth() - value);
            } else if (unit.includes('year')) {
              now.setFullYear(now.getFullYear() - value);
            }
            date = now;
          } else if (direction === 'earlier') {
            // Handle "2 days earlier" as 2 days ago
            if (unit.includes('day')) {
              now.setDate(now.getDate() - value);
            } else if (unit.includes('week')) {
              now.setDate(now.getDate() - value * 7);
            } else if (unit.includes('month')) {
              now.setMonth(now.getMonth() - value);
            } else if (unit.includes('year')) {
              now.setFullYear(now.getFullYear() - value);
            }
            date = now;
          } else if (match[1] && match[2] && match[3]) {
            // Handle absolute dates
            const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                              'july', 'august', 'september', 'october', 'november', 'december'];

            // Check if first group is month name
            if (monthNames.includes(match[1].toLowerCase())) {
              const month = monthNames.indexOf(match[1].toLowerCase());
              const day = parseInt(match[2]);
              const year = parseInt(match[3]);

              date = new Date(year, month, day);

              // Handle time if present
              if (match[5] && match[6]) {
                let hours = parseInt(match[5]);
                const minutes = parseInt(match[6]);
                const period = match[7]?.toLowerCase();

                if (period === 'pm' && hours < 12) {
                  hours += 12;
                } else if (period === 'am' && hours === 12) {
                  hours = 0;
                }

                date.setHours(hours, minutes);
              }
            } else {
              // Numeric date format (MM/DD/YYYY or DD/MM/YYYY)
              const day = parseInt(match[1]);
              const month = parseInt(match[2]) - 1; // months are 0-indexed
              const year = parseInt(match[3]) > 1000 ? parseInt(match[3]) : parseInt(match[3]) + 2000;

              date = new Date(year, month, day);

              // Handle time if present
              if (match[5] && match[6]) {
                let hours = parseInt(match[5]);
                const minutes = parseInt(match[6]);
                const period = match[7]?.toLowerCase();

                if (period === 'pm' && hours < 12) {
                  hours += 12;
                } else if (period === 'am' && hours === 12) {
                  hours = 0;
                }

                date.setHours(hours, minutes);
              }
            }
          } else if (match[1] && match[1].toLowerCase() === 'today') {
            date = new Date();
          } else if (match[1] && match[1].toLowerCase() === 'yesterday') {
            const now = new Date();
            now.setDate(now.getDate() - 1);
            date = now;
          } else if (match[1] && match[1].toLowerCase() === 'tomorrow') {
            const now = new Date();
            now.setDate(now.getDate() + 1);
            date = now;
          }

          if (date) {
            result.submittedAt = {
              value: date,
              confidence: 0.8
            };
            break;
          }
        }
      } catch (e) {
        console.log('Date parsing error:', e);
      }
    }
  }

  return result;
}
