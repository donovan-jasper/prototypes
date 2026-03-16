import React, { useEffect } from 'react';
import { triggerAutoSave } from '@/lib/storage/autoSave';
import { useAppStore } from '@/store/useAppStore';

const AutoSaveManager = () => {
  const { sleepDetected } = useAppStore();

  useEffect(() => {
    if (sleepDetected) {
      triggerAutoSave();
    }
  }, [sleepDetected]);

  return null;
};

export default AutoSaveManager;
