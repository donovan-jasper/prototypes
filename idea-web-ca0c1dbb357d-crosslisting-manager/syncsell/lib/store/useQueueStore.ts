import create from 'zustand';
import { addQueueItem, getQueueItems, deleteQueueItem } from '../db';

interface QueueItem {
  id?: number;
  productId: number;
  platforms: string[];
  timestamp: string;
}

interface QueueState {
  queue: QueueItem[];
  isProcessing: boolean;
  addToQueue: (item: QueueItem) => Promise<void>;
  loadQueue: () => Promise<void>;
  processQueue: () => Promise<void>;
  removeFromQueue: (id: number) => Promise<void>;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  isProcessing: false,

  addToQueue: async (item) => {
    try {
      const id = await addQueueItem(item);
      set((state) => ({
        queue: [...state.queue, { ...item, id }]
      }));
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  },

  loadQueue: async () => {
    try {
      const items = await getQueueItems();
      set({ queue: items });
    } catch (error) {
      console.error('Error loading queue:', error);
      throw error;
    }
  },

  processQueue: async () => {
    const { queue, isProcessing } = get();

    if (isProcessing || queue.length === 0) {
      return;
    }

    set({ isProcessing: true });

    try {
      // Process each item in the queue
      for (const item of queue) {
        try {
          // Here you would implement the actual posting logic
          // For now, we'll just simulate processing
          console.log('Processing queue item:', item);

          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Remove from queue after processing
          await deleteQueueItem(item.id!);
          set((state) => ({
            queue: state.queue.filter(q => q.id !== item.id)
          }));
        } catch (error) {
          console.error('Error processing queue item:', error);
          // Continue with next item even if one fails
        }
      }
    } finally {
      set({ isProcessing: false });
    }
  },

  removeFromQueue: async (id) => {
    try {
      await deleteQueueItem(id);
      set((state) => ({
        queue: state.queue.filter(item => item.id !== id)
      }));
    } catch (error) {
      console.error('Error removing from queue:', error);
      throw error;
    }
  }
}));
