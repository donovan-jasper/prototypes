import create from 'zustand';
import { getTopAppsByContext, getGlobalTopApps } from '@/lib/ml/predictor';
import { detectContext } from '@/lib/context/detector';

interface PredictionsState {
  predictedApps: string[];
  isLoading: boolean;
  error: string | null;
  loadPredictions: () => Promise<void>;
}

export const usePredictionsStore = create<PredictionsState>((set) => ({
  predictedApps: [],
  isLoading: false,
  error: null,
  loadPredictions: async () => {
    set({ isLoading: true, error: null });
    try {
      const context = await detectContext();
      const hour = new Date().getHours();
      const dayOfWeek = new Date().getDay();

      let predictions = await getTopAppsByContext(hour, dayOfWeek, context.location);

      if (predictions.length === 0) {
        predictions = await getGlobalTopApps();
      }

      set({ predictedApps: predictions, isLoading: false });
    } catch (error) {
      console.error('Failed to load predictions:', error);
      set({ error: 'Failed to load app predictions', isLoading: false });
    }
  },
}));
