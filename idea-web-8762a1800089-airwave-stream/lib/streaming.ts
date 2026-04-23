import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';

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
    const userId = await AsyncStorage.getItem('userId') || 'demo-user';
    return `${Config.API_BASE_URL}/stream/${userId}/${channelNumber}`;
  }
};

export const isOnHomeNetwork = async (): Promise<boolean> => {
  try {
    const networkState = await Network.getNetworkStateAsync();

    if (!networkState.isInternetReachable || !networkState.isConnected) {
      return false;
    }

    // Check if we're on the same subnet as the tuner
    const tunerConfig = await AsyncStorage.getItem('tunerConfig');
    if (tunerConfig) {
      try {
        const config = JSON.parse(tunerConfig);
        if (config.ip) {
          const localIp = await Network.getIpAddressAsync();
          if (localIp) {
            // Simple check for same subnet (first 3 octets)
            const localParts = localIp.split('.');
            const tunerParts = config.ip.split('.');
            return localParts[0] === tunerParts[0] &&
                   localParts[1] === tunerParts[1] &&
                   localParts[2] === tunerParts[2];
          }
        }
      } catch (error) {
        console.error('Error checking subnet:', error);
      }
    }

    // Fallback to WiFi check
    return networkState.type === Network.NetworkStateType.WIFI;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};

export const isRemoteStreamingEnabled = async (): Promise<boolean> => {
  const subscriptionStatus = await AsyncStorage.getItem('subscriptionStatus');
  return subscriptionStatus === 'premium' && Config.ENABLE_REMOTE_STREAMING;
};

export const establishRemoteConnection = async (): Promise<boolean> => {
  try {
    const isEnabled = await isRemoteStreamingEnabled();
    if (!isEnabled) return false;

    // In a real implementation, this would:
    // 1. Generate a secure token for the user
    // 2. Establish a WebSocket connection to the backend
    // 3. Set up the reverse proxy tunnel
    // 4. Return true if successful

    // For demo purposes, we'll simulate a successful connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Error establishing remote connection:', error);
    return false;
  }
};
