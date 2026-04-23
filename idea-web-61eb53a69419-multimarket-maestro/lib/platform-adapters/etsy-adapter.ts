import axios from 'axios';
import { Listing } from '../../types';
import { BaseAdapter } from './base-adapter';

export class EtsyAdapter extends BaseAdapter {
  private static readonly API_BASE = 'https://openapi.etsy.com/v3/application';

  async authenticate(): Promise<void> {
    // In a real implementation, this would handle OAuth token refresh
    console.log('EtsyAdapter: Authenticating with Etsy API');
  }

  async createListing(listing: Listing): Promise<Listing> {
    try {
      const response = await axios.post(
        `${EtsyAdapter.API_BASE}/listings`,
        this.mapListingToEtsyFormat(listing),
        {
          headers: {
            'x-api-key': this.apiToken,
            'Content-Type': 'application/json'
          }
        }
      );
      return this.mapEtsyToListingFormat(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateListing(listing: Listing): Promise<Listing> {
    try {
      const response = await axios.put(
        `${EtsyAdapter.API_BASE}/listings/${listing.id}`,
        this.mapListingToEtsyFormat(listing),
        {
          headers: {
            'x-api-key': this.apiToken,
            'Content-Type': 'application/json'
          }
        }
      );
      return this.mapEtsyToListingFormat(response.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteListing(listingId: string): Promise<void> {
    try {
      await axios.delete(
        `${EtsyAdapter.API_BASE}/listings/${listingId}`,
        {
          headers: {
            'x-api-key': this.apiToken
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
        `${EtsyAdapter.API_BASE}/shops/me/listings/active`,
        {
          headers: {
            'x-api-key': this.apiToken
          }
        }
      );
      return response.data.results.map((listing: any) => this.mapEtsyToListingFormat(listing));
    } catch (error) {
      this.handleError(error);
    }
  }

  async fetchOrders(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${EtsyAdapter.API_BASE}/shops/me/receipts`,
        {
          headers: {
            'x-api-key': this.apiToken
          }
        }
      );
      return response.data.results;
    } catch (error) {
      this.handleError(error);
    }
  }

  private mapListingToEtsyFormat(listing: Listing): any {
    return {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      quantity: listing.quantity,
      who_made: 'i_did',
      when_made: 'made_to_order',
      is_supply: true,
      shipping_template_id: 1, // Default template
      taxonomy_id: 1, // Default category
      materials: listing.attributes?.materials || [],
      tags: listing.tags || [],
      images: listing.images.map((url, index) => ({
        listing_image_id: index + 1,
        url: url,
        rank: index + 1
      }))
    };
  }

  private mapEtsyToListingFormat(etsyListing: any): Listing {
    return {
      id: etsyListing.listing_id.toString(),
      title: etsyListing.title,
      description: etsyListing.description,
      price: parseFloat(etsyListing.price),
      quantity: etsyListing.quantity,
      images: etsyListing.images.map((img: any) => img.url_570xN),
      platforms: ['etsy'],
      syncStatus: 'synced',
      attributes: {
        materials: etsyListing.materials,
        tags: etsyListing.tags
      }
    };
  }
}
