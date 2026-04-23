import * as SecureStore from 'expo-secure-store';

export class SecureStorage {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      throw error;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      throw error;
    }
  }

  static async deleteItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore deleteItem error:', error);
      throw error;
    }
  }

  static async getToken(platform: string): Promise<string | null> {
    return this.getItem(`${platform}_api_token`);
  }

  static async setToken(platform: string, token: string): Promise<void> {
    return this.setItem(`${platform}_api_token`, token);
  }

  static async getRefreshToken(platform: string): Promise<string | null> {
    return this.getItem(`${platform}_refresh_token`);
  }

  static async setRefreshToken(platform: string, token: string): Promise<void> {
    return this.setItem(`${platform}_refresh_token`, token);
  }

  static async clearPlatformTokens(platform: string): Promise<void> {
    await this.deleteItem(`${platform}_api_token`);
    await this.deleteItem(`${platform}_refresh_token`);
  }
}
