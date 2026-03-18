import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkInfo, SignalData } from '@/types';
import { calculateHealthScore, getSignalStrength, getNetworkTypeLabel } from '@/utils/signalCalculator';

export function useSignalData() {
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
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
    });

    return () => unsubscribe();
  }, []);

  return { signalData, isLoading };
}
