import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo mode: Always return the test stream URL
const TEST_STREAM_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

export const buildStreamUrl = (channelId: string, isLocal: boolean): string => {
  // For demo purposes, always return the test stream
  return TEST_STREAM_URL;
};

export const isOnHomeNetwork = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    
    if (!networkState.isInternetEnabled || !networkState.isConnected) {
      return false;
    }
    
    // In a real implementation, we would compare the WiFi SSID
    // or check if we're on the same subnet as the tuner
    // For demo purposes, we'll return true if connected to WiFi
    return networkState.type === Network.NetworkStateType.WIFI;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};
