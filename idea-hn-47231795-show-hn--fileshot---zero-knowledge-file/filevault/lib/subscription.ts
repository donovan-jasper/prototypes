import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { FREE_SHARE_LIMIT } from '@/constants/Config';

export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [biometricLock, setBiometricLock] = useState(false);

  useEffect(() => {
    // Load user preferences from storage
    // This is a simplified example
  }, []);

  const canShare = () => {
    return isPremium || shareCount < FREE_SHARE_LIMIT;
  };

  const incrementShareCount = () => {
    setShareCount(prev => prev + 1);
  };

  const upgradeToPremium = () => {
    // Implement actual upgrade logic here
    Alert.alert('Upgrade', 'Premium upgrade would be implemented here');
    setIsPremium(true);
  };

  const toggleBiometricLock = () => {
    setBiometricLock(prev => !prev);
    // Save preference to storage
  };

  return {
    isPremium,
    shareCount,
    biometricLock,
    canShare,
    incrementShareCount,
    upgradeToPremium,
    toggleBiometricLock,
  };
};
