import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const THREADS_CLIENT_ID = 'YOUR_THREADS_CLIENT_ID';
const THREADS_CLIENT_SECRET = 'YOUR_THREADS_CLIENT_SECRET';
const THREADS_REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: Platform.OS !== 'web',
});

interface ThreadsAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ThreadsUser {
  id: string;
  username: string;
  name: string;
}

export class ThreadsClient {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  async authenticate(): Promise<ThreadsUser> {
    try {
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${THREADS_CLIENT_ID}&redirect_uri=${THREADS_REDIRECT_URI}&scope=threads_basic,threads_content_publish,threads_manage_insights&response_type=code`;

      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: THREADS_REDIRECT_URI,
      });

      if (result.type === 'success' && result.params.code) {
        const tokenResponse = await this.exchangeCodeForToken(result.params.code);
        this.accessToken = tokenResponse.access_token;
        this.tokenExpiry = new Date(Date.now() + tokenResponse.expires_in * 1000);

        // Store token securely
        await SecureStore.setItemAsync('threads_token', this.accessToken);
        await SecureStore.setItemAsync('threads_expiry', this.tokenExpiry.toISOString());

        // Get user info
        const user = await this.getUserInfo();
        return user;
      }

      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Threads authentication error:', error);
      throw error;
    }
  }

  private async exchangeCodeForToken(code: string): Promise<ThreadsAuthResponse> {
    const response = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `client_id=${THREADS_CLIENT_ID}&client_secret=${THREADS_CLIENT_SECRET}&code=${code}&redirect_uri=${THREADS_REDIRECT_URI}&grant_type=authorization_code`,
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return response.json();
  }

  private async getUserInfo(): Promise<ThreadsUser> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://graph.threads.net/me', {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  async publishPost(text: string, mediaUrls?: string[]): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const body: any = {
      text,
      media_type: mediaUrls ? 'IMAGE' : 'TEXT',
    };

    if (mediaUrls) {
      body.image_url = mediaUrls[0];
    }

    const response = await fetch('https://graph.threads.net/me/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'Failed to publish post');
    }

    const result = await response.json();
    return result.id;
  }

  async fetchComments(threadId: string): Promise<any[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`https://graph.threads.net/${threadId}/replies`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    const data = await response.json();
    return data.data || [];
  }

  async replyToComment(threadId: string, text: string): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`https://graph.threads.net/${threadId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'Failed to reply to comment');
    }

    const result = await response.json();
    return result.id;
  }

  async refreshToken(): Promise<void> {
    // Implementation for token refresh would go here
    // Typically involves making a request to the token endpoint with refresh_token grant type
    throw new Error('Token refresh not implemented');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('threads_token');
    const expiry = await SecureStore.getItemAsync('threads_expiry');

    if (!token || !expiry) {
      return false;
    }

    this.accessToken = token;
    this.tokenExpiry = new Date(expiry);

    return this.tokenExpiry > new Date();
  }
}
