import create from 'zustand';

const useAppStore = create((set) => ({
  sleepDetected: false,
  emergencyContact: '',
  setSleepDetected: (detected) => set({ sleepDetected: detected }),
  setEmergencyContact: (contact) => set({ emergencyContact: contact }),
}));

export default useAppStore;
