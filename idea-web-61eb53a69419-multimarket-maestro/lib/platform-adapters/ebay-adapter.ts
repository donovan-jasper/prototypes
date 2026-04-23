import axios from 'axios';
import { Listing } from '../../types';
import { BaseAdapter } from './base-adapter';
import { SecureStorage } from '../storage';

export class EbayAdapter extends BaseAdapter {
  private static readonly API_BASE = 'https://api.ebay.com/sell/inventory/v1';

  constructor() {
    super('ebay');
  }

  async authenticate(): Promise<void> {
    try {
      // In a real implementation, this would handle OAuth token refresh
      console.log('EbayAdapter: Authenticating with eBay API');

      // Check if we have tokens
      const token = await SecureStorage.getToken('ebay');
      const refreshToken = await SecureStorage.getRefreshToken('ebay');

      if (!token || !refreshToken) {
        throw new Error('No eBay tokens available');
      }

      this.apiToken = token;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error('EbayAdapter authentication error:', error);
      throw error;
    }
  }

  async createListing(listing: Listing): Promise<Listing> {
    try {
      if (!this.apiToken) {
        await this.authenticate();
      }

      const response = await axios.post(
        `${EbayAdapter.API_BASE}/offer`,
        this.mapListingToEbayFormat(listing),
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return this.mapEbayToListingFormat(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateListing(listing: Listing): Promise<Listing> {
    try {
      if (!this.apiToken) {
        await this.authenticate();
      }

      const response = await axios.put(
        `${EbayAdapter.API_BASE}/offer/${listing.id}`,
        this.mapListingToEbayFormat(listing),
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return this.mapEbayToListingFormat(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteListing(listingId: string): Promise<void> {
    try {
      if (!this.apiToken) {
        await this.authenticate();
      }

      await axios.delete(
        `${EbayAdapter.API_BASE}/offer/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  async fetchListings(): Promise<Listing[]> {
    try {
      if (!this.apiToken) {
        await this.authenticate();
      }

      const response = await axios.get(
        `${EbayAdapter.API_BASE}/offer`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );
      return response.data.offers.map((offer: any) => this.mapEbayToListingFormat(offer));
    } catch (error) {
      this.handleError(error);
    }
  }

  async fetchOrders(): Promise<any[]> {
    try {
      if (!this.apiToken) {
        await this.authenticate();
      }

      const response = await axios.get(
        'https://api.ebay.com/sell/fulfillment/v1/order',
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );
      return response.data.orders;
    } catch (error) {
      this.handleError(error);
    }
  }

  private mapListingToEbayFormat(listing: Listing): any {
    return {
      sku: listing.id,
      merchantLocationKey: 'DEFAULT',
      availableQuantity: listing.quantity,
      format: 'FIXED_PRICE',
      availableQuantitySchedule: {
        eventType: 'NONE'
      },
      product: {
        title: listing.title,
        description: listing.description,
        aspects: listing.attributes || {}
      },
      listingPolicies: {
        fulfillmentPolicyId: 'DEFAULT',
        paymentPolicyId: 'DEFAULT',
        returnPolicyId: 'DEFAULT'
      },
      listingDescription: listing.description,
      quantityLimitPerBuyer: 0,
      pricingSummary: {
        price: {
          value: listing.price,
          currency: 'USD'
        }
      }
    };
  }

  private mapEbayToListingFormat(ebayOffer: any): Listing {
    return {
      id: ebayOffer.offerId,
      title: ebayOffer.product.title,
      description: ebayOffer.listingDescription,
      price: parseFloat(ebayOffer.pricingSummary.price.value),
      quantity: ebayOffer.availableQuantity,
      images: ebayOffer.product.imageUrls || [],
      platforms: ['ebay'],
      syncStatus: 'synced',
      attributes: ebayOffer.product.aspects || {}
    };
  }
}
