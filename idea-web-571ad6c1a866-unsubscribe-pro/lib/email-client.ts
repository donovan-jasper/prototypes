import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { IMAPClient } from 'emailjs-imap-client';
import { Email } from '../types';

WebBrowser.maybeCompleteAuthSession();

const GMAIL_AUTH_URL = 'https://accounts.google.com/o/oauth2/auth';
const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify';

const OUTLOOK_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const OUTLOOK_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const OUTLOOK_SCOPES = 'https://outlook.office.com/IMAP.AccessAsUser.All https://outlook.office.com/IMAP.FullAccess';

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
  private imapConfig: {
    host: string;
    port: number;
    tls: boolean;
    auth: {
      user: string;
      pass: string;
    };
  } | null = null;

  constructor(provider: 'gmail' | 'outlook' | 'other', clientId: string, imapConfig?: {
    host: string;
    port: number;
    tls: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }) {
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
      if (imapConfig) {
        this.imapConfig = imapConfig;
      }
    }
  }

  async authenticate(): Promise<boolean> {
    if (this.emailProvider === 'other' && !this.imapConfig) {
      throw new Error('IMAP configuration required for other providers');
    }

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
      throw error;
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
          body: message.bodyPreview || '',
          date: message.receivedDateTime,
          headers: {
            'List-Unsubscribe': message.internetMessageHeaders?.find(
              (h: any) => h.name === 'List-Unsubscribe'
            )?.value || '',
          },
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
    if (!this.imapConfig) {
      throw new Error('IMAP configuration not provided');
    }

    try {
      const client = new IMAPClient(
        this.imapConfig.host,
        this.imapConfig.port,
        {
          auth: this.imapConfig.auth,
          useSecureTransport: this.imapConfig.tls,
        }
      );

      await client.connect();
      await client.selectMailbox('INBOX');

      const messages = await client.listMessages('INBOX', '1:*', ['uid', 'envelope', 'body[]']);
      const emails: Email[] = [];

      for (const message of messages.slice(0, limit)) {
        const headers = this.parseImapHeaders(message.envelope);
        const body = this.decodeImapBody(message['body[]']);

        emails.push({
          id: message.uid.toString(),
          from: headers['From'] || 'Unknown',
          subject: headers['Subject'] || '(No subject)',
          body,
          date: new Date(message.envelope.date).toISOString(),
          headers,
          classification: 'unknown',
          tags: [],
        });
      }

      await client.close();
      return emails;
    } catch (error) {
      console.error('Error fetching IMAP emails:', error);
      throw error;
    }
  }

  private parseHeaders(headers: any[]): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach(header => {
      result[header.name] = header.value;
    });
    return result;
  }

  private parseImapHeaders(envelope: any): Record<string, string> {
    return {
      'From': envelope.from[0].address,
      'Subject': envelope.subject,
      'Date': envelope.date,
    };
  }

  private decodeBody(payload: any): string {
    if (payload.parts) {
      // Handle multipart messages
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain') {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    } else if (payload.body && payload.body.data) {
      // Handle simple messages
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    return '';
  }

  private decodeImapBody(body: any): string {
    if (typeof body === 'string') {
      return body;
    } else if (body instanceof Buffer) {
      return body.toString('utf-8');
    } else if (body && body.data) {
      return Buffer.from(body.data, 'base64').toString('utf-8');
    }
    return '';
  }

  async executeUnsubscribe(unsubscribeLink: string): Promise<void> {
    try {
      // For web-based unsubscribe links
      if (unsubscribeLink.startsWith('http')) {
        await WebBrowser.openAuthSessionAsync(unsubscribeLink, this.config.redirectUri);
      }
      // For mailto: links
      else if (unsubscribeLink.startsWith('mailto:')) {
        // In a real app, we would open the user's email client
        // with a pre-filled unsubscribe email
        console.log('Would open email client to send unsubscribe request to:', unsubscribeLink);
      }
    } catch (error) {
      console.error('Error executing unsubscribe:', error);
      throw error;
    }
  }
}
