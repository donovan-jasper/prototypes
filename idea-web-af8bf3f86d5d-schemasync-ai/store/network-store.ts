import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isOnline: boolean;
  isInitializing: boolean;
  setOnlineStatus: (status: boolean) => void;
  initializeNetworkListener: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  isInitializing: true,
  setOnlineStatus: (status) => set({ isOnline: status }),
  initializeNetworkListener: () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      set({
        isOnline: state.isConnected ?? true,
        isInitializing: false
      });
    });

    // Check initial state
    NetInfo.fetch().then(state => {
      set({
        isOnline: state.isConnected ?? true,
        isInitializing: false
      });
    });

    return unsubscribe;
  },
}));

// Initialize the network listener when the store is created
useNetworkStore.getState().initializeNetworkListener();
