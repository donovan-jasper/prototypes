import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { startBackgroundMonitoring, stopBackgroundMonitoring, getRecentEntropy } from '@/lib/sensors';

interface LivenessContextType {
  isMonitoring: boolean;
  currentEntropy: number;
}

const LivenessContext = createContext<LivenessContextType>({
  isMonitoring: false,
  currentEntropy: 0,
});

export const useLiveness = () => useContext(LivenessContext);

interface Props {
  children: React.ReactNode;
}

export function LivenessMonitor({ children }: Props) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentEntropy, setCurrentEntropy] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startBackgroundMonitoring();
    setIsMonitoring(true);

    intervalRef.current = setInterval(() => {
      const entropy = getRecentEntropy();
      setCurrentEntropy(entropy);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopBackgroundMonitoring();
      setIsMonitoring(false);
    };
  }, []);

  return (
    <LivenessContext.Provider value={{ isMonitoring, currentEntropy }}>
      {children}
    </LivenessContext.Provider>
  );
}
