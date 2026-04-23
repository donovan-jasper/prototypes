import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BackgroundTaskManager } from '../services/BackgroundTaskManager';
import { AlertCoordinator } from '../services/AlertCoordinator';
import { DetectionEngine } from '../services/DetectionEngine';
import { AlertService } from '../services/AlertService';
import { ActivityProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import { AppState } from 'react-native';

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
      const detectionEngine = new DetectionEngine('study'); // Default profile
      detectionEngineRef.current = detectionEngine;

      // Initialize alert service
      const alertService = new AlertService();
      alertServiceRef.current = alertService;

      // Initialize alert coordinator
      const alertCoordinator = new AlertCoordinator(
        detectionEngine,
        alertService,
        {
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
        setIsMonitoring(state.isMonitoring || false);
        setActiveProfile(state.activeProfile || null);
        setCurrentSession(state.currentSession || {
          startTime: null,
          drowsinessEvents: 0,
          elapsedTime: 0,
        });
        setUiState(state.uiState || {
          isAlertActive: false,
          alertLevel: 0,
          isSnoozed: false,
          snoozeEndTime: null,
        });

        // Restore detection engine profile if available
        if (state.activeProfile && detectionEngineRef.current) {
          detectionEngineRef.current.setProfile(state.activeProfile.type);
        }
      }
    } catch (error) {
      console.error('Failed to restore session state:', error);
    }
  };

  const startSession = (profile: ActivityProfile) => {
    setActiveProfile(profile);
    setIsMonitoring(true);
    setCurrentSession({
      startTime: Date.now(),
      drowsinessEvents: 0,
      elapsedTime: 0,
    });

    // Update detection engine profile
    if (detectionEngineRef.current) {
      detectionEngineRef.current.setProfile(profile.type);
    }

    // Start background task
    startBackgroundTask();

    // Start timer for elapsed time
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCurrentSession(prev => ({
        ...prev,
        elapsedTime: prev.startTime ? Date.now() - prev.startTime : 0,
      }));
    }, 1000);
  };

  const stopSession = () => {
    setIsMonitoring(false);

    // Stop background task
    stopBackgroundTask();

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset UI state
    setUiState({
      isAlertActive: false,
      alertLevel: 0,
      isSnoozed: false,
      snoozeEndTime: null,
    });

    // Reset detection engine
    if (detectionEngineRef.current) {
      detectionEngineRef.current.reset();
    }
  };

  const recordDrowsinessEvent = () => {
    setCurrentSession(prev => ({
      ...prev,
      drowsinessEvents: prev.drowsinessEvents + 1,
    }));
  };

  const startBackgroundTask = async () => {
    if (backgroundTaskManagerRef.current) {
      await backgroundTaskManagerRef.current.startTask();
    }
  };

  const stopBackgroundTask = async () => {
    if (backgroundTaskManagerRef.current) {
      await backgroundTaskManagerRef.current.stopTask();
    }
  };

  const updateUIState = (newState: Partial<AppContextType['uiState']>) => {
    setUiState(prev => ({
      ...prev,
      ...newState,
    }));
  };

  const on = (event: string, listener: (...args: any[]) => void) => {
    eventEmitterRef.current.on(event, listener);
  };

  const off = (event: string, listener: (...args: any[]) => void) => {
    eventEmitterRef.current.off(event, listener);
  };

  return (
    <AppContext.Provider
      value={{
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
        on,
        off,
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
