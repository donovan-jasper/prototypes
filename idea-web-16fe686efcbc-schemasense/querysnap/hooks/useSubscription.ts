import { useState, useEffect } from 'react';
import useStore from '../lib/store';

export const useSubscription = () => {
  const { subscription, updateSubscription } = useStore();

  const upgrade = () => {
    // Implement upgrade functionality
    updateSubscription({ isPremium: true, usage: { queries: 0, limit: Infinity } });
  };

  return { ...subscription, upgrade };
};
