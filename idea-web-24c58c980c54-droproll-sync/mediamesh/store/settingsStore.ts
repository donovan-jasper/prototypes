import create from 'zustand';

export const useSettingsStore = create((set) => ({
  syncFrequency: '6h',
  setSyncFrequency: (frequency) => set({ syncFrequency: frequency }),
  duplicateDetection: true,
  setDuplicateDetection: (value) => set({ duplicateDetection: value }),
}));
