import { Listing } from '../../types';
import { SecureStorage } from '../storage';

export interface PlatformAdapter {
  authenticate(): Promise<void>;
  createListing(listing: Listing): Promise<Listing>;
  updateListing(listing: Listing): Promise<Listing>;
  deleteListing(listingId: string): Promise<void>;
  fetchListings(): Promise<Listing[]>;
  fetchOrders(): Promise<any[]>;
  refreshToken(): Promise<void>;
}

export abstract class BaseAdapter implements PlatformAdapter {
  protected apiToken: string;
  protected refreshToken: string;
  protected platformName: string;

  constructor(platformName: string) {
    this.platformName = platformName;
    this.apiToken = '';
    this.refreshToken = '';
  }

  async initialize(): Promise<void> {
    const token = await SecureStorage.getToken(this.platformName);
    const refreshToken = await SecureStorage.getRefreshToken(this.platformName);

    if (token && refreshToken) {
      this.apiToken = token;
      this.refreshToken = refreshToken;
    } else {
      throw new Error('No tokens available for this platform');
    }
  }

  abstract authenticate(): Promise<void>;
  abstract createListing(listing: Listing): Promise<Listing>;
  abstract updateListing(listing: Listing): Promise<Listing>;
  abstract deleteListing(listingId: string): Promise<void>;
  abstract fetchListings(): Promise<Listing[]>;
  abstract fetchOrders(): Promise<any[]>;

  async refreshToken(): Promise<void> {
    try {
      // In a real implementation, this would call the platform's token refresh endpoint
      // For now, we'll just simulate it
      const newToken = `refreshed_${this.platformName}_token_${Date.now()}`;
      const newRefreshToken = `refreshed_${this.platformName}_refresh_token_${Date.now()}`;

      await SecureStorage.setToken(this.platformName, newToken);
      await SecureStorage.setRefreshToken(this.platformName, newRefreshToken);

      this.apiToken = newToken;
      this.refreshToken = newRefreshToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  protected handleError(error: any): never {
    console.error('Platform API error:', error);

    // Check if this is an authentication error (401)
    if (error.response && error.response.status === 401) {
      // Attempt to refresh the token
      try {
        this.refreshToken();
        // Retry the original request
        throw error; // Re-throw to let the caller handle it
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Authentication failed. Please reconnect your account.');
      }
    }

    throw new Error(`Platform API error: ${error.message}`);
  }
}
