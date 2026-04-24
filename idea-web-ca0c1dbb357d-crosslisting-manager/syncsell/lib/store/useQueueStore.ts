import create from 'zustand';
import { addToQueue as dbAddToQueue, getQueue as dbGetQueue, removeFromQueue as dbRemoveFromQueue } from '../db';
import { postProduct as postToTikTok } from '../api/tiktok';
import { postProduct as postToInstagram } from '../api/instagram';
import { postProduct as postToFacebook } from '../api/facebook';
import { getProduct } from '../db';

interface QueueItem {
  id: number;
  productId: number;
  platforms: string[];
  timestamp: string;
}

interface QueueState {
  queue: QueueItem[];
  isProcessing: boolean;
  addToQueue: (item: Omit<QueueItem, 'id'>) => Promise<void>;
  processQueue: () => Promise<void>;
  loadQueue: () => Promise<void>;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  isProcessing: false,

  addToQueue: async (item) => {
    const id = await dbAddToQueue(item);
    set(state => ({
      queue: [...state.queue, { ...item, id }]
    }));
  },

  processQueue: async () => {
    if (get().isProcessing) return;

    set({ isProcessing: true });

    try {
      const queue = await dbGetQueue();

      for (const item of queue) {
        try {
          const product = await getProduct(item.productId);

          for (const platform of item.platforms) {
            try {
              switch (platform) {
                case 'TikTok Shop':
                  await postToTikTok(product, 'mock-api-key');
                  break;
                case 'Instagram Shopping':
                  await postToInstagram(product, 'mock-api-key', 'mock-business-id');
                  break;
                case 'Facebook Marketplace':
                  await postToFacebook(product, 'mock-api-key', 'mock-page-id');
                  break;
              }
            } catch (error) {
              console.error(`Failed to post to ${platform}:`, error);
              // Continue with other platforms even if one fails
              continue;
            }
          }

          // Remove from queue if successful
          await dbRemoveFromQueue(item.id);
          set(state => ({
            queue: state.queue.filter(q => q.id !== item.id)
          }));
        } catch (error) {
          console.error('Error processing queue item:', error);
          // Continue with next item if current one fails
          continue;
        }
      }
    } finally {
      set({ isProcessing: false });
    }
  },

  loadQueue: async () => {
    const queue = await dbGetQueue();
    set({ queue });
  }
}));
