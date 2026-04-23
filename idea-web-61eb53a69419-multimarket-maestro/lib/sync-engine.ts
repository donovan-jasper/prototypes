import { PlatformAdapter } from './platform-adapters/base-adapter';
import { initDatabase, addListing, updateListing, getListings, addSyncQueueItem, getSyncQueue, clearSyncQueue } from './database';
import { Listing, SyncQueueItem } from '../types';
import { useAppStore } from '../store/app-store';

export class SyncEngine {
  private adapters: Map<string, PlatformAdapter> = new Map();
  private isSyncing: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await initDatabase();
  }

  registerAdapter(platform: string, adapter: PlatformAdapter) {
    this.adapters.set(platform, adapter);
  }

  async syncAll() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    const store = useAppStore.getState();

    try {
      // Process queued changes first
      await this.processQueue();

      // Sync all enabled platforms
      const platforms = store.platforms.filter(p => p.enabled);
      const allListings = await getListings();

      for (const platform of platforms) {
        const adapter = this.adapters.get(platform.name);
        if (!adapter) continue;

        // Fetch latest listings from platform
        const remoteListings = await adapter.fetchListings();

        // Update local listings with remote data
        for (const remoteListing of remoteListings) {
          const localListing = allListings.find(l => l.id === remoteListing.id);
          if (localListing) {
            await updateListing({
              ...localListing,
              ...remoteListing,
              syncStatus: 'synced'
            });
          } else {
            await addListing({
              ...remoteListing,
              platforms: [platform.name],
              syncStatus: 'synced'
            });
          }
        }
      }

      // Check for conflicts
      await this.detectConflicts();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async queueChange(item: SyncQueueItem) {
    await addSyncQueueItem(item);
    const store = useAppStore.getState();
    store.setSyncStatus('pending');
  }

  private async processQueue() {
    const queue = await getSyncQueue();
    const store = useAppStore.getState();

    for (const item of queue) {
      try {
        const adapter = this.adapters.get(item.platform);
        if (!adapter) continue;

        switch (item.action) {
          case 'create':
            await adapter.createListing(item.listing);
            break;
          case 'update':
            await adapter.updateListing(item.listing);
            break;
          case 'delete':
            await adapter.deleteListing(item.listingId);
            break;
        }

        // Update local listing status
        if (item.listingId) {
          await updateListing({
            ...item.listing,
            syncStatus: 'synced'
          });
        }

        // Remove from queue
        await clearSyncQueue(item.id);
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error);
        await updateListing({
          ...item.listing,
          syncStatus: 'error'
        });
      }
    }

    if (queue.length > 0) {
      store.setSyncStatus('synced');
    }
  }

  private async detectConflicts() {
    const listings = await getListings();
    const conflicts = new Map<string, Listing[]>();

    // Group listings by title (simple conflict detection)
    listings.forEach(listing => {
      if (!conflicts.has(listing.title)) {
        conflicts.set(listing.title, []);
      }
      conflicts.get(listing.title)?.push(listing);
    });

    // Find conflicts where same item appears on multiple platforms
    for (const [title, items] of conflicts.entries()) {
      if (items.length > 1) {
        const platforms = new Set(items.flatMap(item => item.platforms));
        if (platforms.size > 1) {
          console.warn(`Conflict detected for "${title}" on platforms: ${Array.from(platforms).join(', ')}`);
          // In a real app, you would notify the user here
        }
      }
    }
  }
}
