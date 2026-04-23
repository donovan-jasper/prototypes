import { BskyAgent, AtpSessionData } from '@atproto/api';
import * as SecureStore from 'expo-secure-store';

export class BlueskyClient {
  private agent: BskyAgent;
  private session: AtpSessionData | null = null;

  constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
    });
  }

  async authenticate(handle: string, password: string): Promise<AtpSessionData> {
    try {
      this.session = await this.agent.login({
        identifier: handle,
        password: password,
      });

      // Store session securely
      await SecureStore.setItemAsync('bluesky_session', JSON.stringify(this.session));

      return this.session;
    } catch (error) {
      console.error('Bluesky authentication error:', error);
      throw error;
    }
  }

  async publishPost(text: string, embed?: any): Promise<string> {
    if (!this.session) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.agent.post({
        text,
        embed,
      });

      return result.uri;
    } catch (error) {
      console.error('Bluesky post error:', error);
      throw error;
    }
  }

  async getNotifications(limit: number = 50): Promise<any[]> {
    if (!this.session) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await this.agent.listNotifications({ limit });
      return response.data.notifications;
    } catch (error) {
      console.error('Bluesky notifications error:', error);
      throw error;
    }
  }

  async getPostThread(uri: string, depth: number = 2): Promise<any> {
    if (!this.session) {
      throw new Error('Not authenticated');
    }

    try {
      return await this.agent.getPostThread({ uri, depth });
    } catch (error) {
      console.error('Bluesky thread error:', error);
      throw error;
    }
  }

  async replyToPost(parentUri: string, text: string): Promise<string> {
    if (!this.session) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.agent.post({
        text,
        reply: {
          parent: {
            uri: parentUri,
            cid: '', // Would need to fetch this from the parent post
          },
          root: {
            uri: parentUri,
            cid: '',
          },
        },
      });

      return result.uri;
    } catch (error) {
      console.error('Bluesky reply error:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const sessionData = await SecureStore.getItemAsync('bluesky_session');

    if (!sessionData) {
      return false;
    }

    try {
      this.session = JSON.parse(sessionData);
      // Verify the session is still valid
      await this.agent.resumeSession(this.session);
      return true;
    } catch (error) {
      console.error('Bluesky session validation error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    this.session = null;
    await SecureStore.deleteItemAsync('bluesky_session');
  }
}
