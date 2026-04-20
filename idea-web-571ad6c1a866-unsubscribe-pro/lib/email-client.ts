import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { IMAPClient } from 'emailjs-imap-client';
import { Email } from '../types';

WebBrowser.maybeCompleteAuthSession();

const GMAIL_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth';
const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

const OUTLOOK_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const OUTLOOK_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const OUTLOOK_SCOPES = 'https://outlook.office.com/IMAP.AccessAsUser.All';

interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
}

export class EmailClient {
  private config: OAuthConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private emailProvider: 'gmail' | 'outlook' | 'other' = 'other';

  constructor(provider: 'gmail' | 'outlook' | 'other', clientId: string) {
    this.emailProvider = provider;

    if (provider === 'gmail') {
      this.config = {
        authUrl: GMAIL_AUTH_URL,
        tokenUrl: GMAIL_TOKEN_URL,
        clientId,
        redirectUri: AuthSession.makeRedirectUri({
          useProxy: true,
          native: 'inboxzen://oauth',
        }),
        scopes: GMAIL_SCOPES,
      };
    } else if (provider === 'outlook') {
      this.config = {
        authUrl: OUTLOOK_AUTH_URL,
        tokenUrl: OUTLOOK_TOKEN_URL,
        clientId,
        redirectUri: AuthSession.makeRedirectUri({
          useProxy: true,
          native: 'inboxzen://oauth',
        }),
        scopes: OUTLOOK_SCOPES,
      };
    } else {
      // For other providers, we'll use IMAP directly
      this.config = {
        authUrl: '',
        tokenUrl: '',
        clientId: '',
        redirectUri: '',
        scopes: '',
      };
    }
  }

  async authenticate(): Promise<boolean> {
    if (this.emailProvider === 'other') {
      // For IMAP, we'll handle authentication separately
      return true;
    }

    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: this.config.clientId,
        redirectUri: this.config.redirectUri,
        scopes: [this.config.scopes],
        responseType: AuthSession.ResponseType.Token,
        usePKCE: false,
      });

      const result = await authRequest.promptAsync({
        useProxy: true,
      });

      if (result.type === 'success') {
        this.accessToken = result.params.access_token;
        this.refreshToken = result.params.refresh_token;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async fetchEmails(limit: number = 50): Promise<Email[]> {
    if (this.emailProvider === 'gmail') {
      return this.fetchGmailEmails(limit);
    } else if (this.emailProvider === 'outlook') {
      return this.fetchOutlookEmails(limit);
    } else {
      return this.fetchImapEmails(limit);
    }
  }

  private async fetchGmailEmails(limit: number): Promise<Email[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const data = await response.json();
      const emails: Email[] = [];

      for (const message of data.messages) {
        const msgResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        const msgData = await msgResponse.json();
        const headers = this.parseHeaders(msgData.payload.headers);

        emails.push({
          id: message.id,
          from: headers['From'] || 'Unknown',
          subject: headers['Subject'] || '(No subject)',
          body: this.decodeBody(msgData.payload),
          date: new Date(parseInt(headers['Date'] || '0')).toISOString(),
          headers,
          classification: 'unknown',
          tags: [],
        });
      }

      return emails;
    } catch (error) {
      console.error('Error fetching Gmail emails:', error);
      throw error;
    }
  }

  private async fetchOutlookEmails(limit: number): Promise<Email[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/messages?$top=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const data = await response.json();
      const emails: Email[] = [];

      for (const message of data.value) {
        emails.push({
          id: message.id,
          from: message.from?.emailAddress?.address || 'Unknown',
          subject: message.subject || '(No subject)',
          body: message.body?.content || '',
          date: message.receivedDateTime,
          headers: this.parseHeaders(message.internetMessageHeaders),
          classification: 'unknown',
          tags: [],
        });
      }

      return emails;
    } catch (error) {
      console.error('Error fetching Outlook emails:', error);
      throw error;
    }
  }

  private async fetchImapEmails(limit: number): Promise<Email[]> {
    // This would require user to provide IMAP credentials
    // For demo purposes, we'll return mock data
    return [
      {
        id: '1',
        from: 'newsletter@amazon.com',
        subject: 'Your weekly Amazon newsletter',
        body: 'Check out our latest offers and deals...',
        date: new Date(Date.now() - 86400000).toISOString(),
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@amazon.com>'
        },
        classification: 'newsletter',
        tags: ['unsubscribe-available']
      },
      {
        id: '2',
        from: 'support@netflix.com',
        subject: 'Your Netflix account update',
        body: 'Your subscription will renew on...',
        date: new Date(Date.now() - 172800000).toISOString(),
        headers: {
          'X-Priority': '1'
        },
        classification: 'service-notification',
        tags: []
      },
      {
        id: '3',
        from: 'orders@amazon.com',
        subject: 'Your order #12345 has shipped',
        body: 'Your package is on its way...',
        date: new Date(Date.now() - 259200000).toISOString(),
        headers: {},
        classification: 'transactional',
        tags: []
      },
      {
        id: '4',
        from: 'promo@bestbuy.com',
        subject: 'Exclusive deal just for you!',
        body: 'Click here to claim your discount...',
        date: new Date(Date.now() - 345600000).toISOString(),
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@bestbuy.com>'
        },
        classification: 'promotional',
        tags: ['unsubscribe-available', 'urgent']
      },
      {
        id: '5',
        from: 'spam@fakepharmacy.com',
        subject: 'VIAGRA - 100% GUARANTEED!',
        body: 'Order now and get 50% off...',
        date: new Date(Date.now() - 432000000).toISOString(),
        headers: {},
        classification: 'spam',
        tags: ['tracking']
      }
    ];
  }

  private parseHeaders(headers: any[]): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach(header => {
      result[header.name] = header.value;
    });
    return result;
  }

  private decodeBody(payload: any): string {
    if (payload.parts) {
      // Handle multipart messages
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    } else if (payload.body && payload.body.data) {
      // Handle single part messages
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    return '';
  }

  async unsubscribe(email: Email): Promise<boolean> {
    // Extract unsubscribe link from email headers or body
    const unsubscribeLink = this.extractUnsubscribeLink(email);

    if (!unsubscribeLink) {
      console.log('No unsubscribe link found');
      return false;
    }

    try {
      // For demo purposes, we'll just log the action
      console.log(`Unsubscribing from ${email.from} via ${unsubscribeLink}`);
      return true;
    } catch (error) {
      console.error('Error during unsubscribe:', error);
      return false;
    }
  }

  private extractUnsubscribeLink(email: Email): string | null {
    // Check List-Unsubscribe header first
    if (email.headers['List-Unsubscribe']) {
      const match = email.headers['List-Unsubscribe'].match(/<([^>]+)>/);
      if (match) return match[1];
    }

    // Check for common unsubscribe patterns in the body
    const body = email.body.toLowerCase();
    const unsubscribePatterns = [
      /unsubscribe/i,
      /click here to stop receiving/i,
      /remove me from this list/i,
      /opt-out/i,
      /stop receiving/i
    ];

    for (const pattern of unsubscribePatterns) {
      const match = body.match(pattern);
      if (match) {
        // In a real app, we would need to find the actual link near this text
        // This is simplified for the demo
        return `https://example.com/unsubscribe?email=${encodeURIComponent(email.from)}`;
      }
    }

    return null;
  }
}
