import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BackgroundTaskManager } from '../services/BackgroundTaskManager';
import { ActivityProfile } from '../types';

interface AppContextType {
  isMonitoring: boolean;
  activeProfile: ActivityProfile | null;
  currentSession: {
    startTime: number | null;
    drowsinessEvents: number;
    elapsedTime: number;
  };
  startSession: (profile: ActivityProfile) => void;
  stopSession: () => void;
  recordDrowsinessEvent: () => void;
  setActiveProfile: (profile: ActivityProfile) => void;
  startBackgroundTask: () => Promise<void>;
  stopBackgroundTask: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeProfile, setActiveProfile] = useState<ActivityProfile | null>(null);
  const [currentSession, setCurrentSession] = useState({
    startTime: null,
    drowsinessEvents: 0,
    elapsedTime: 0,
  });

  const backgroundTaskManagerRef = useRef<BackgroundTaskManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize background task manager
    const initialize = async () => {
      const manager = new BackgroundTaskManager();
      await manager.initialize();
      backgroundTaskManagerRef.current = manager;
    };

    initialize();

    return () => {
      // Clean up when component unmounts
      if (backgroundTaskManagerRef.current) {
        backgroundTaskManagerRef.current.cleanup();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startBackgroundTask = async () => {
    if (backgroundTaskManagerRef.current) {
      await backgroundTaskManagerRef.current.registerBackgroundTask();
    }
  };

  const stopBackgroundTask = async () => {
    if (backgroundTaskManagerRef.current) {
      await backgroundTaskManagerRef.current.unregisterBackgroundTask();
    }
  };

  const startSession = async (profile: ActivityProfile) => {
    if (isMonitoring) return;

    setActiveProfile(profile);
    setCurrentSession({
      startTime: Date.now(),
      drowsinessEvents: 0,
      elapsedTime: 0,
    });
    setIsMonitoring(true);

    // Start background monitoring
    if (backgroundTaskManagerRef.current) {
      await backgroundTaskManagerRef.current.startMonitoring();
    }

    // Start background task
    await startBackgroundTask();

    // Start timer for elapsed time
    timerRef.current = setInterval(() => {
      setCurrentSession(prev => ({
        ...prev,
        elapsedTime: prev.startTime ? Math.floor((Date.now() - prev.startTime) / 1000) : 0,
      }));
    }, 1000);
  };

  const stopSession = async () => {
    if (!isMonitoring) return;

    setIsMonitoring(false);

    // Stop background monitoring
    if (backgroundTaskManagerRef.current) {
      await backgroundTaskManagerRef.current.stopMonitoring();
    }

    // Stop background task
    await stopBackgroundTask();

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Save session to database
    if (backgroundTaskManagerRef.current && currentSession.startTime) {
      await backgroundTaskManagerRef.current.databaseService.saveSession({
        profileId: activeProfile?.id || 'default',
        startTime: currentSession.startTime,
        endTime: Date.now(),
        drowsinessEvents: currentSession.drowsinessEvents,
      });
    }

    // Reset session
    setCurrentSession({
      startTime: null,
      drowsinessEvents: 0,
      elapsedTime: 0,
    });
  };

  const recordDrowsinessEvent = () => {
    setCurrentSession(prev => ({
      ...prev,
      drowsinessEvents: prev.drowsinessEvents + 1,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        isMonitoring,
        activeProfile,
        currentSession,
        startSession,
        stopSession,
        recordDrowsinessEvent,
        setActiveProfile,
        startBackgroundTask,
        stopBackgroundTask,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
