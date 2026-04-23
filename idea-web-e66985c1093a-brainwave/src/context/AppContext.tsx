import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BackgroundTaskManager } from '../services/BackgroundTaskManager';
import { AlertCoordinator } from '../services/AlertCoordinator';
import { DetectionEngine } from '../services/DetectionEngine';
import { AlertService } from '../services/AlertService';
import { ActivityProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';

interface AppContextType {
  isMonitoring: boolean;
  activeProfile: ActivityProfile | null;
  currentSession: {
    startTime: number | null;
    drowsinessEvents: number;
    elapsedTime: number;
  };
  uiState: {
    isAlertActive: boolean;
    alertLevel: number;
    isSnoozed: boolean;
    snoozeEndTime: number | null;
  };
  startSession: (profile: ActivityProfile) => void;
  stopSession: () => void;
  recordDrowsinessEvent: () => void;
  setActiveProfile: (profile: ActivityProfile) => void;
  startBackgroundTask: () => Promise<void>;
  stopBackgroundTask: () => Promise<void>;
  saveSessionState: () => Promise<void>;
  restoreSessionState: () => Promise<void>;
  updateUIState: (newState: Partial<AppContextType['uiState']>) => void;
  on: (event: string, listener: (...args: any[]) => void) => void;
  off: (event: string, listener: (...args: any[]) => void) => void;
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
  const [uiState, setUiState] = useState({
    isAlertActive: false,
    alertLevel: 0,
    isSnoozed: false,
    snoozeEndTime: null,
  });

  const backgroundTaskManagerRef = useRef<BackgroundTaskManager | null>(null);
  const detectionEngineRef = useRef<DetectionEngine | null>(null);
  const alertServiceRef = useRef<AlertService | null>(null);
  const alertCoordinatorRef = useRef<AlertCoordinator | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventEmitterRef = useRef(new EventEmitter());

  useEffect(() => {
    // Initialize services
    const initialize = async () => {
      // Initialize background task manager
      const backgroundTaskManager = new BackgroundTaskManager();
      await backgroundTaskManager.initialize();
      backgroundTaskManagerRef.current = backgroundTaskManager;

      // Initialize detection engine
      const detectionEngine = new DetectionEngine();
      detectionEngineRef.current = detectionEngine;

      // Initialize alert service
      const alertService = new AlertService();
      alertServiceRef.current = alertService;

      // Initialize alert coordinator
      const alertCoordinator = new AlertCoordinator(
        detectionEngine,
        alertService,
        {
          activeProfile,
          recordDrowsinessEvent,
          updateUIState,
          on: eventEmitterRef.current.on.bind(eventEmitterRef.current),
          off: eventEmitterRef.current.off.bind(eventEmitterRef.current),
        } as AppContextType
      );
      alertCoordinatorRef.current = alertCoordinator;

      // Restore session state if available
      await restoreSessionState();
    };

    initialize();

    // Handle app state changes
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'background') {
        await saveSessionState();
      } else if (nextAppState === 'active') {
        await restoreSessionState();
      }
    };

    // Add app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Clean up when component unmounts
      if (backgroundTaskManagerRef.current) {
        backgroundTaskManagerRef.current.cleanup();
      }
      if (detectionEngineRef.current) {
        detectionEngineRef.current.cleanup();
      }
      if (alertServiceRef.current) {
        alertServiceRef.current.cleanup();
      }
      if (alertCoordinatorRef.current) {
        alertCoordinatorRef.current.cleanup();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      subscription.remove();
    };
  }, []);

  const saveSessionState = async () => {
    try {
      const state = {
        isMonitoring,
        activeProfile,
        currentSession,
        uiState,
      };
      await AsyncStorage.setItem('sessionState', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save session state:', error);
    }
  };

  const restoreSessionState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('sessionState');
      if (savedState) {
        const state = JSON.parse(savedState);
        setIsMonitoring(state.isMonitoring);
        setActiveProfile(state.activeProfile);
        setCurrentSession(state.currentSession);
        setUiState(state.uiState);

        // If session was active, restart monitoring
        if (state.isMonitoring && state.currentSession.startTime) {
          await startBackgroundTask();
          startTimer();
        }
      }
    } catch (error) {
      console.error('Failed to restore session state:', error);
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCurrentSession(prev => ({
        ...prev,
        elapsedTime: prev.startTime ? Math.floor((Date.now() - prev.startTime) / 1000) : 0,
      }));
    }, 1000);
  };

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

    // Start timer
    startTimer();

    // Save state immediately
    await saveSessionState();
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

    // Save final session state
    await saveSessionState();
  };

  const recordDrowsinessEvent = () => {
    setCurrentSession(prev => ({
      ...prev,
      drowsinessEvents: prev.drowsinessEvents + 1,
    }));
  };

  const updateUIState = (newState: Partial<AppContextType['uiState']>) => {
    setUiState(prev => ({
      ...prev,
      ...newState,
    }));
  };

  const contextValue: AppContextType = {
    isMonitoring,
    activeProfile,
    currentSession,
    uiState,
    startSession,
    stopSession,
    recordDrowsinessEvent,
    setActiveProfile,
    startBackgroundTask,
    stopBackgroundTask,
    saveSessionState,
    restoreSessionState,
    updateUIState,
    on: eventEmitterRef.current.on.bind(eventEmitterRef.current),
    off: eventEmitterRef.current.off.bind(eventEmitterRef.current),
  };

  return (
    <AppContext.Provider value={contextValue}>
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
