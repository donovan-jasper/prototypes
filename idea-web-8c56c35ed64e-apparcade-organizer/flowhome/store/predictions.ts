import create from 'zustand';
import { getTopAppsByContext, getGlobalTopApps } from '@/lib/ml/predictor';
import { detectContext } from '@/lib/context/detector';

interface PredictionsState {
  predictedApps: string[];
  loadPredictions: () => Promise<void>;
}

export const usePredictionsStore = create<PredictionsState>((set) => ({
  predictedApps: [],
  loadPredictions: async () => {
    const context = await detectContext();
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    let predictions = await getTopAppsByContext(hour, dayOfWeek, context.location);
    
    if (predictions.length === 0) {
      predictions = await getGlobalTopApps();
    }

    set({ predictedApps: predictions });
  },
}));
