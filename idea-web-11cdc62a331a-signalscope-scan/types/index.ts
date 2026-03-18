export interface NetworkInfo {
  type: string | null;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  details: {
    cellularGeneration?: '2g' | '3g' | '4g' | '5g' | null;
    carrier?: string | null;
    strength?: number | null;
  } | null;
}

export interface SignalData {
  timestamp: number;
  networkType: string;
  signalStrength: number;
  healthScore: number;
  latency: number | null;
  downloadSpeed: number | null;
  uploadSpeed: number | null;
  carrier: string | null;
}

export interface LocationData {
  id: number;
  latitude: number;
  longitude: number;
  signalStrength: number;
  networkType: string;
  carrier: string;
  timestamp: number;
}
