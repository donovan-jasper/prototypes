import { saveFocusSession } from './db';
import { blockApps, unblockApps } from './app-blocker';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

interface FocusSession {
  id: string;
  duration: number;
  startTime: number;
  endTime: number;
  blockedApps: string[];
  mode: 'strict' | 'gentle';
  completed?: boolean;
}

const BACKGROUND_TASK_NAME = 'focus-session-task';
const sessions: Map<string, FocusSession> = new Map();

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  const activeSession = getActiveSession();
  if (activeSession) {
    const remaining = Math.max(0, Math.floor((activeSession.endTime - Date.now()) / 1000));
    if (remaining <= 0) {
      await endFocusSession(activeSession.id, true);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
  }
  return BackgroundFetch.BackgroundFetchResult.NoData;
});

export function startFocusSession(
  duration: number,
  blockedApps: string[] = [],
  mode: 'strict' | 'gentle' = 'gentle'
): FocusSession {
  const session: FocusSession = {
    id: Date.now().toString(),
    duration,
    startTime: Date.now(),
    endTime: Date.now() + duration * 60 * 1000,
    blockedApps,
    mode,
  };

  sessions.set(session.id, session);

  if (blockedApps.length > 0) {
    blockApps(blockedApps);
  }

  // Register background task
  BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: 60, // Run every minute
    stopOnTerminate: false,
    startOnBoot: true,
  });

  return session;
}

export async function endFocusSession(sessionId: string, completed: boolean): Promise<void> {
  const session = sessions.get(sessionId);
  if (session) {
    session.completed = completed;

    await saveFocusSession(
      session.id,
      session.startTime,
      session.endTime,
      session.duration,
      session.mode,
      completed
    );

    unblockApps();
    sessions.delete(sessionId);

    // Unregister background task
    BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
  }
}

export function canOverride(session: FocusSession): boolean {
  if (session.mode === 'strict') {
    return false;
  }
  return true;
}

export function getActiveSession(): FocusSession | null {
  const activeSessions = Array.from(sessions.values());
  return activeSessions.length > 0 ? activeSessions[0] : null;
}

export function getSessionProgress(session: FocusSession): number {
  const elapsed = Date.now() - session.startTime;
  const total = session.duration * 60 * 1000;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
