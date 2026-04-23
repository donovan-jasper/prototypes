import axios from 'axios';
import { Listing, Order } from '../../types';
import { BaseAdapter } from './base-adapter';
import { SecureStorage } from '../storage';

export class EbayAdapter extends BaseAdapter {
  private static readonly API_BASE = 'https://api.ebay.com/sell/inventory/v1';
  private static readonly AUTH_BASE = 'https://api.ebay.com/identity/v1/oauth2';
  private static readonly FULFILLMENT_BASE = 'https://api.ebay.com/sell/fulfillment/v1';
  private static readonly MARKETPLACE_ID = 'EBAY_US';

  constructor() {
    super('ebay');
  }

  async authenticate(clientId: string, clientSecret: string, redirectUri: string, authCode?: string): Promise<void> {
    try {
      if (authCode) {
        // Exchange auth code for tokens
        const response = await axios.post(
          `${EbayAdapter.AUTH_BASE}/token`,
          `grant_type=authorization_code&code=${authCode}&redirect_uri=${encodeURIComponent(redirectUri)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            }
          }
        );

        this.apiToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token;

        // Store tokens securely
        await SecureStorage.setToken('ebay', this.apiToken);
        await SecureStorage.setRefreshToken('ebay', this.refreshToken);
      } else {
        // Try to get existing tokens
        const token = await SecureStorage.getToken('ebay');
        const refreshToken = await SecureStorage.getRefreshToken('ebay');

        if (!token || !refreshToken) {
          throw new Error('No eBay tokens available');
        }

        this.apiToken = token;
        this.refreshToken = refreshToken;
      }
    } catch (error) {
      console.error('EbayAdapter authentication error:', error);
      throw error;
    }
  }

  async refreshAccessToken(clientId: string, clientSecret: string): Promise<void> {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        `${EbayAdapter.AUTH_BASE}/token`,
        `grant_type=refresh_token&refresh_token=${this.refreshToken}&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fscope%2Finventory`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
          }
        }
      );

      this.apiToken = response.data.access_token;
      await SecureStorage.setToken('ebay', this.apiToken);
    } catch (error) {
      console.error('EbayAdapter token refresh error:', error);
      throw error;
    }
  }

  async createListing(listing: Listing): Promise<Listing> {
    try {
      if (!this.apiToken) {
        throw new Error('Not authenticated with eBay');
      }

      const ebayFormat = this.mapListingToEbayFormat(listing);
      const response = await axios.post(
        `${EbayAdapter.API_BASE}/offer`,
        ebayFormat,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': EbayAdapter.MARKETPLACE_ID
          }
        }
      );

      return this.mapEbayToListingFormat(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updateListing(listing: Listing): Promise<Listing> {
    try {
      if (!this.apiToken) {
        throw new Error('Not authenticated with eBay');
      }

      const ebayFormat = this.mapListingToEbayFormat(listing);
      const response = await axios.put(
        `${EbayAdapter.API_BASE}/offer/${listing.id}`,
        ebayFormat,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': EbayAdapter.MARKETPLACE_ID
          }
        }
      );

      return this.mapEbayToListingFormat(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteListing(listingId: string): Promise<void> {
    try {
      if (!this.apiToken) {
        throw new Error('Not authenticated with eBay');
      }

      await axios.delete(
        `${EbayAdapter.API_BASE}/offer/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'X-EBAY-C-MARKETPLACE-ID': EbayAdapter.MARKETPLACE_ID
          }
        }
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async fetchListings(): Promise<Listing[]> {
    try {
      if (!this.apiToken) {
        throw new Error('Not authenticated with eBay');
      }

      const response = await axios.get(
        `${EbayAdapter.API_BASE}/offer`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'X-EBAY-C-MARKETPLACE-ID': EbayAdapter.MARKETPLACE_ID
          }
        }
      );

      return response.data.offers.map((offer: any) => this.mapEbayToListingFormat(offer));
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async fetchOrders(): Promise<Order[]> {
    try {
      if (!this.apiToken) {
        throw new Error('Not authenticated with eBay');
      }

      const response = await axios.get(
        `${EbayAdapter.FULFILLMENT_BASE}/order`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'X-EBAY-C-MARKETPLACE-ID': EbayAdapter.MARKETPLACE_ID
          }
        }
      );

      return response.data.orders.map((order: any) => this.mapEbayToOrderFormat(order));
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private mapListingToEbayFormat(listing: Listing): any {
    return {
      sku: listing.id,
      merchantLocationKey: 'default',
      availableQuantity: listing.quantity,
      format: 'FIXED_PRICE',
      availableQuantitySchedule: {
        eventType: 'NONE'
      },
      pricingSummary: {
        price: {
          value: listing.price,
          currency: 'USD'
        }
      },
      listingDescription: listing.description,
      listingPolicies: {
        fulfillmentPolicyId: 'default',
        paymentPolicyId: 'default',
        returnPolicyId: 'default'
      },
      merchantLocationKeyOverride: false,
      quantityLimitPerBuyer: 0,
      includeCatalogProductDetails: false,
      product: {
        title: listing.title,
        aspects: listing.attributes || {},
        description: listing.description,
        imageUrls: listing.images
      }
    };
  }

  private mapEbayToListingFormat(ebayOffer: any): Listing {
    return {
      id: ebayOffer.sku,
      title: ebayOffer.product?.title || 'Untitled',
      description: ebayOffer.listingDescription || '',
      price: ebayOffer.pricingSummary?.price?.value || 0,
      quantity: ebayOffer.availableQuantity || 0,
      images: ebayOffer.product?.imageUrls || [],
      platforms: ['ebay'],
      syncStatus: 'synced',
      attributes: ebayOffer.product?.aspects || {}
    };
  }

  private mapEbayToOrderFormat(ebayOrder: any): Order {
    return {
      id: ebayOrder.orderId,
      platform: 'ebay',
      items: ebayOrder.lineItems.map((item: any) => ({
        id: item.lineItemId,
        title: item.title,
        price: item.lineItemCost?.value || 0,
        quantity: item.quantity || 1
      })),
      total: ebayOrder.pricingSummary?.total?.value || 0,
      status: ebayOrder.orderFulfillmentStatus || 'UNKNOWN',
      createdAt: new Date(ebayOrder.creationDate).toISOString()
    };
  }

  private handleError(error: any) {
    if (axios.isAxiosError(error)) {
      console.error('EbayAdapter API error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Token might be expired, trigger refresh
        console.log('Token expired, will attempt refresh on next request');
      }
    } else {
      console.error('EbayAdapter error:', error);
    }
  }
}
