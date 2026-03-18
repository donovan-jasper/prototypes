import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkInfo, SignalData } from '@/types';
import { calculateHealthScore, getSignalStrength, getNetworkTypeLabel } from '@/utils/signalCalculator';
import { saveSignalReading } from '@/services/database';
import { getCurrentLocation } from '@/services/location';

export function useSignalData() {
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
      const networkInfo: NetworkInfo = {
        type: state.type,
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        details: state.details as NetworkInfo['details'],
      };

      const data: SignalData = {
        timestamp: Date.now(),
        networkType: getNetworkTypeLabel(networkInfo),
        signalStrength: getSignalStrength(networkInfo),
        healthScore: calculateHealthScore(networkInfo),
        latency: null,
        downloadSpeed: null,
        uploadSpeed: null,
        carrier: networkInfo.details?.carrier || null,
      };

      setSignalData(data);
      setIsLoading(false);

      // Save to database with location
      try {
        const location = await getCurrentLocation();
        if (location) {
          await saveSignalReading({
            latitude: location.latitude,
            longitude: location.longitude,
            signal_strength: data.signalStrength,
            network_type: data.networkType,
            carrier: data.carrier,
            download_speed: data.downloadSpeed,
            upload_speed: data.uploadSpeed,
            latency: data.latency,
            timestamp: data.timestamp,
          });
        }
      } catch (error) {
        console.error('Error saving signal reading:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  return { signalData, isLoading };
}
