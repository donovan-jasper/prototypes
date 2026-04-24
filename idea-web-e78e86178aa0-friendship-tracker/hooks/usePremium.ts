import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const premiumStatus = await AsyncStorage.getItem('premiumStatus');
        setIsPremium(premiumStatus === 'true');
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };

    checkPremiumStatus();
  }, []);

  const upgradeToPremium = async () => {
    try {
      await AsyncStorage.setItem('premiumStatus', 'true');
      setIsPremium(true);
      // In a real app, you would integrate with a payment processor here
      console.log('Premium upgrade successful');
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    }
  };

  return {
    isPremium,
    upgradeToPremium,
  };
};
