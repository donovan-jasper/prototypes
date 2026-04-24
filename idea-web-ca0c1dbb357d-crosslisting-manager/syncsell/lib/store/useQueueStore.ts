import create from 'zustand';
import { persist } from 'zustand/middleware';
import * as Network from 'expo-network';
import { postProduct as postToTikTok } from '../api/tiktok';
import { postProduct as postToInstagram } from '../api/instagram';
import { postProduct as postToFacebook } from '../api/facebook';
import { getProducts } from '../db';

interface QueueItem {
  productId: number;
  platforms: string[];
  timestamp: string;
}

interface QueueState {
  queue: QueueItem[];
  addToQueue: (item: QueueItem) => Promise<void>;
  processQueue: () => Promise<void>;
  removeFromQueue: (productId: number) => Promise<void>;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      queue: [],

      addToQueue: async (item) => {
        set(state => ({
          queue: [...state.queue, item]
        }));
      },

      processQueue: async () => {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) return;

        const { queue } = get();
        const products = await getProducts();

        for (const item of queue) {
          const product = products.find(p => p.id === item.productId);
          if (!product) continue;

          try {
            for (const platform of item.platforms) {
              switch (platform) {
                case 'TikTok Shop':
                  await postToTikTok(product, 'api-key');
                  break;
                case 'Instagram Shopping':
                  await postToInstagram(product, 'api-key', 'business-account-id');
                  break;
                case 'Facebook Marketplace':
                  await postToFacebook(product, 'api-key', 'page-id');
                  break;
              }
            }

            // Remove from queue if successful
            set(state => ({
              queue: state.queue.filter(q => q.productId !== item.productId)
            }));
          } catch (error) {
            console.error(`Failed to post product ${item.productId} to ${platform}:`, error);
            // Keep in queue for retry
          }
        }
      },

      removeFromQueue: async (productId) => {
        set(state => ({
          queue: state.queue.filter(item => item.productId !== productId)
        }));
      }
    }),
    {
      name: 'queue-storage',
      getStorage: () => require('expo-secure-store').default,
    }
  )
);
