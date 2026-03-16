import create from 'zustand';
import { getClouds, insertCloud, deleteCloud } from '../database/queries';

export const useCloudStore = create((set) => ({
  clouds: [],
  loadClouds: async () => {
    const clouds = await getClouds();
    set({ clouds });
  },
  connectCloud: async (service, token) => {
    await insertCloud({ service, token });
    const clouds = await getClouds();
    set({ clouds });
  },
  disconnectCloud: async (id) => {
    await deleteCloud(id);
    const clouds = await getClouds();
    set({ clouds });
  },
}));
