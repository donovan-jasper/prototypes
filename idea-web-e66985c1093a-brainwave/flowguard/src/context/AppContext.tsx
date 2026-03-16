import React, { createContext, useState, useEffect, useRef } from 'react';
import { ActivityProfile, Session, Settings } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { SensorService } from '../services/SensorService';
import { DetectionEngine } from '../services/DetectionEngine';
import { AlertService } from '../services/AlertService';

interface AppContextType {
  profiles: ActivityProfile[];
  activeProfile: string | null;
  sessions: Session[];
  settings: Settings;
  isSessionActive: boolean;
  elapsedTime: number;
  drowsinessEvents: number;
  startSession: (profileId: string) => void;
  stopSession: () => void;
  addProfile: (profile: Omit<ActivityProfile, 'id'>) => void;
  updateProfile: (profile: ActivityProfile) => void;
  deleteProfile: (profileId: string) => void;
  getSessions: () => void;
  updateSettings: (settings: Settings) => void;
}

export const AppContext = createContext<AppContextType>({
  profiles: [],
  activeProfile: null,
  sessions: [],
  settings: { hapticEnabled: true, soundEnabled: true },
  isSessionActive: false,
  elapsedTime: 0,
  drowsinessEvents: 0,
  startSession: () => {},
  stopSession: () => {},
  addProfile: () => {},
  updateProfile: () => {},
  deleteProfile: () => {},
  getSessions: () => {},
  updateSettings: () => {},
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ActivityProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<Settings>({ hapticEnabled: true, soundEnabled: true });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [drowsinessEvents, setDrowsinessEvents] = useState(0);

  const dbService = useRef(new DatabaseService());
  const sensorService = useRef(new SensorService());
  const detectionEngine = useRef<DetectionEngine | null>(null);
  const alertService = useRef(new AlertService());
  const sessionTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionStartTime = useRef<number | null>(null);

  useEffect(() => {
    // Initialize database and load data
    const initialize = async () => {
      await dbService.current.initialize();
      await loadProfiles();
      await loadSessions();
      await loadSettings();
    };

    initialize();
  }, []);

  useEffect(() => {
    // Set up sensor data listener
    const handleSensorData = (data: any) => {
      if (detectionEngine.current) {
        detectionEngine.current.processSensorData(data);
        if (detectionEngine.current.isDrowsy()) {
          handleDrowsinessEvent();
        }
      }
    };

    sensorService.current.onDataReceived(handleSensorData);

    return () => {
      sensorService.current.removeDataListener(handleSensorData);
    };
  }, []);

  const loadProfiles = async () => {
    const loadedProfiles = await dbService.current.getProfiles();
    setProfiles(loadedProfiles);
    if (loadedProfiles.length > 0 && !activeProfile) {
      setActiveProfile(loadedProfiles[0].id);
    }
  };

  const loadSessions = async () => {
    const loadedSessions = await dbService.current.getSessions();
    setSessions(loadedSessions);
  };

  const loadSettings = async () => {
    const loadedSettings = await dbService.current.getSettings();
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  };

  const startSession = async (profileId: string) => {
    if (isSessionActive) return;

    setActiveProfile(profileId);
    setIsSessionActive(true);
    setElapsedTime(0);
    setDrowsinessEvents(0);
    sessionStartTime.current = Date.now();

    // Initialize detection engine with selected profile
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      detectionEngine.current = new DetectionEngine(profile.id, profile.sensitivity);
    }

    // Start sensor monitoring
    await sensorService.current.startMonitoring();

    // Start timer
    sessionTimer.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopSession = async () => {
    if (!isSessionActive) return;

    // Stop timer
    if (sessionTimer.current) {
      clearInterval(sessionTimer.current);
      sessionTimer.current = null;
    }

    // Stop sensor monitoring
    await sensorService.current.stopMonitoring();

    // Save session to database
    if (sessionStartTime.current && activeProfile) {
      const session: Omit<Session, 'id'> = {
        profileId: activeProfile,
        startTime: sessionStartTime.current,
        endTime: Date.now(),
        drowsinessEvents,
      };
      await dbService.current.saveSession(session);
      await loadSessions();
    }

    // Reset state
    setIsSessionActive(false);
    sessionStartTime.current = null;
    detectionEngine.current = null;
  };

  const handleDrowsinessEvent = async () => {
    // Increment event counter
    setDrowsinessEvents(prev => prev + 1);

    // Trigger alert
    await alertService.current.triggerAlert({
      hapticEnabled: settings.hapticEnabled,
      soundEnabled: settings.soundEnabled,
    });

    // Reset detection engine after alert
    if (detectionEngine.current && activeProfile) {
      const profile = profiles.find(p => p.id === activeProfile);
      if (profile) {
        detectionEngine.current = new DetectionEngine(profile.id, profile.sensitivity);
      }
    }
  };

  const addProfile = async (profile: Omit<ActivityProfile, 'id'>) => {
    await dbService.current.addProfile(profile);
    await loadProfiles();
  };

  const updateProfile = async (profile: ActivityProfile) => {
    await dbService.current.updateProfile(profile);
    await loadProfiles();
  };

  const deleteProfile = async (profileId: string) => {
    await dbService.current.deleteProfile(profileId);
    await loadProfiles();
  };

  const updateSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await dbService.current.updateSettings(newSettings);
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        activeProfile,
        sessions,
        settings,
        isSessionActive,
        elapsedTime,
        drowsinessEvents,
        startSession,
        stopSession,
        addProfile,
        updateProfile,
        deleteProfile,
        getSessions: loadSessions,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
