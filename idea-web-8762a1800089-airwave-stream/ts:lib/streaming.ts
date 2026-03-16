import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const buildStreamUrl = (channelId: string, isLocal: boolean): string => {
  if (isLocal) {
    // For local streaming, use the tuner's IP address
    // This assumes the tuner is accessible on the local network
    return `http://192.168.1.100:5004/auto/v${channelId}`;
  } else {
    // For remote streaming, use the backend proxy
    // This would require authentication and a secure tunnel
    const userId = 'demo-user'; // In a real app, this would come from auth
    return `https://api.tunelocal.app/stream/${userId}/${channelId}`;
  }
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
    return networkState.networkType === Network.NetworkType.WIFI;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};
