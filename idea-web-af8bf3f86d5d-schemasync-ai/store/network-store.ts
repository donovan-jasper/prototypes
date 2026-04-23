import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  initializeNetworkListener: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  setOnlineStatus: (status) => set({ isOnline: status }),
  initializeNetworkListener: () => {
    NetInfo.addEventListener(state => {
      set({ isOnline: state.isConnected ?? true });
    });
  },
}));
