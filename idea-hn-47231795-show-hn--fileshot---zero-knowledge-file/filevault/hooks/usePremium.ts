import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { FREE_SHARE_LIMIT } from '@/constants/Config';

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  useEffect(() => {
    // Load user preferences from storage
    // This is a simplified example
  }, []);

  const canShare = () => {
    return isPremium || shareCount < FREE_SHARE_LIMIT;
  };

  const incrementShareCount = () => {
    setShareCount(prev => prev + 1);
    if (!isPremium && shareCount + 1 >= FREE_SHARE_LIMIT) {
      setShowPremiumGate(true);
    }
  };

  const upgradeToPremium = () => {
    // Implement actual upgrade logic here
    Alert.alert('Upgrade', 'Premium upgrade would be implemented here');
    setIsPremium(true);
    setShowPremiumGate(false);
  };

  return {
    isPremium,
    shareCount,
    showPremiumGate,
    canShare,
    incrementShareCount,
    upgradeToPremium,
  };
};
