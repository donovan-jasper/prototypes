import { create } from 'zustand';
import { SmartCollection } from '../lib/ml/patterns';

interface PredictionsState {
  smartCollections: SmartCollection[];
  topPredictions: string[];
  loading: boolean;
  error: string | null;
  setSmartCollections: (collections: SmartCollection[]) => void;
  setTopPredictions: (predictions: string[]) => void;
  loadPredictions: () => Promise<void>;
}

export const usePredictionsStore = create<PredictionsState>((set) => ({
  smartCollections: [],
  topPredictions: [],
  loading: false,
  error: null,

  setSmartCollections: (collections) => set({ smartCollections: collections }),
  setTopPredictions: (predictions) => set({ topPredictions: predictions }),

  loadPredictions: async () => {
    set({ loading: true, error: null });
    try {
      // Load collections from database
      const collections = await loadCollectionsFromDB();
      set({ smartCollections: collections });

      // Load top predictions (simplified for now)
      const topApps = collections.flatMap(c => c.apps).slice(0, 8);
      set({ topPredictions: topApps, loading: false });
    } catch (error) {
      set({ error: 'Failed to load predictions', loading: false });
    }
  },
}));
