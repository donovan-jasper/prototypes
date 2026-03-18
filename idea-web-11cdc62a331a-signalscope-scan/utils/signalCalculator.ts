import { NetworkInfo } from '@/types';

export function calculateHealthScore(networkInfo: NetworkInfo): number {
  if (!networkInfo.isConnected) return 0;
  
  const generation = networkInfo.details?.cellularGeneration;
  const strength = networkInfo.details?.strength || 0;
  
  let baseScore = 0;
  
  switch (generation) {
    case '5g':
      baseScore = 90;
      break;
    case '4g':
      baseScore = 70;
      break;
    case '3g':
      baseScore = 40;
      break;
    case '2g':
      baseScore = 20;
      break;
    default:
      baseScore = 50;
  }
  
  const strengthBonus = Math.min(strength * 10, 10);
  
  return Math.min(Math.max(baseScore + strengthBonus, 0), 100);
}

export function getHealthColor(score: number): string {
  if (score >= 70) return '#4CAF50';
  if (score >= 40) return '#FFC107';
  return '#F44336';
}

export function getSignalStrength(networkInfo: NetworkInfo): number {
  return networkInfo.details?.strength || 0;
}

export function getNetworkTypeLabel(networkInfo: NetworkInfo): string {
  const generation = networkInfo.details?.cellularGeneration;
  
  if (!networkInfo.isConnected) return 'No Connection';
  
  switch (generation) {
    case '5g':
      return '5G';
    case '4g':
      return 'LTE';
    case '3g':
      return '3G';
    case '2g':
      return '2G';
    default:
      return networkInfo.type || 'Unknown';
  }
}
