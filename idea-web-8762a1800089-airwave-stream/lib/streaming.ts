import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const buildStreamUrl = async (channelNumber: string, isLocal: boolean): Promise<string> => {
  if (isLocal) {
    // Get tuner IP from stored config
    const tunerConfig = await AsyncStorage.getItem('tunerConfig');
    let tunerIp = '192.168.1.100'; // Default fallback
    
    if (tunerConfig) {
      try {
        const config = JSON.parse(tunerConfig);
        tunerIp = config.ip || tunerIp;
      } catch (error) {
        console.error('Error parsing tuner config:', error);
      }
    }
    
    // Build HLS URL using channel number (e.g., '7.1', '2.1')
    return `http://${tunerIp}:5004/auto/v${channelNumber}`;
  } else {
    // For remote streaming, use the backend proxy
    const userId = 'demo-user'; // In a real app, this would come from auth
    return `https://api.tunelocal.app/stream/${userId}/${channelNumber}`;
  }
};

export const isOnHomeNetwork = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    
    if (!networkState.isInternetReachable || !networkState.isConnected) {
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
