import axios from 'axios';
import { Listing } from '../../types';
import { BaseAdapter } from './base-adapter';

export class DepopAdapter extends BaseAdapter {
  private static readonly API_BASE = 'https://web.depop.com/api/v1';

  async authenticate(): Promise<void> {
    // In a real implementation, this would handle OAuth token refresh
    console.log('DepopAdapter: Authenticating with Depop API');
  }

  async createListing(listing: Listing): Promise<Listing> {
    try {
      const response = await axios.post(
        `${DepopAdapter.API_BASE}/listings`,
        this.mapListingToDepopFormat(listing),
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return this.mapDepopToListingFormat(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateListing(listing: Listing): Promise<Listing> {
    try {
      const response = await axios.put(
        `${DepopAdapter.API_BASE}/listings/${listing.id}`,
        this.mapListingToDepopFormat(listing),
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return this.mapDepopToListingFormat(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteListing(listingId: string): Promise<void> {
    try {
      await axios.delete(
        `${DepopAdapter.API_BASE}/listings/${listingId}`,
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
      const response = await axios.get(
        `${DepopAdapter.API_BASE}/listings`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );
      return response.data.listings.map((listing: any) => this.mapDepopToListingFormat(listing));
    } catch (error) {
      this.handleError(error);
    }
  }

  async fetchOrders(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${DepopAdapter.API_BASE}/orders`,
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

  private mapListingToDepopFormat(listing: Listing): any {
    return {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      quantity: listing.quantity,
      brand: listing.attributes?.brand || '',
      condition: listing.attributes?.condition || 'new',
      category: listing.attributes?.category || 'accessories',
      tags: listing.tags || [],
      images: listing.images.map((url, index) => ({
        url: url,
        rank: index + 1
      }))
    };
  }

  private mapDepopToListingFormat(depopListing: any): Listing {
    return {
      id: depopListing.id,
      title: depopListing.title,
      description: depopListing.description,
      price: parseFloat(depopListing.price),
      quantity: depopListing.quantity,
      images: depopListing.images.map((img: any) => img.url),
      platforms: ['depop'],
      syncStatus: 'synced',
      attributes: {
        brand: depopListing.brand,
        condition: depopListing.condition,
        category: depopListing.category,
        tags: depopListing.tags
      }
    };
  }
}
