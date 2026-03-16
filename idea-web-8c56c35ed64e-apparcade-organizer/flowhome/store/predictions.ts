import create from 'zustand';
import { predictApps } from '@/lib/ml/predictor';
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
    const locationId = context.location === 'home' ? 0 : context.location === 'work' ? 1 : 2;

    const predictions = await predictApps(hour, dayOfWeek, locationId);
    const predictedApps = predictions.map((_, index) => index.toString());
    set({ predictedApps });
  },
}));
