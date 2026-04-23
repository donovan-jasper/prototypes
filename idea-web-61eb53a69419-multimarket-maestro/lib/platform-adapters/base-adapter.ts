import { Listing } from '../../types';

export interface PlatformAdapter {
  authenticate(): Promise<void>;
  createListing(listing: Listing): Promise<Listing>;
  updateListing(listing: Listing): Promise<Listing>;
  deleteListing(listingId: string): Promise<void>;
  fetchListings(): Promise<Listing[]>;
  fetchOrders(): Promise<any[]>;
}

export abstract class BaseAdapter implements PlatformAdapter {
  protected apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  abstract authenticate(): Promise<void>;
  abstract createListing(listing: Listing): Promise<Listing>;
  abstract updateListing(listing: Listing): Promise<Listing>;
  abstract deleteListing(listingId: string): Promise<void>;
  abstract fetchListings(): Promise<Listing[]>;
  abstract fetchOrders(): Promise<any[]>;

  protected handleError(error: any): never {
    console.error('Platform API error:', error);
    throw new Error(`Platform API error: ${error.message}`);
  }
}
