import create from 'zustand';

const useAppStore = create((set) => ({
  sleepDetected: false,
  setSleepDetected: (detected) => set({ sleepDetected: detected }),
}));

export default useAppStore;
