import { saveFocusSession } from './db';

interface FocusSession {
  id: string;
  duration: number;
  startTime: number;
  endTime: number;
  completed?: boolean;
}

const sessions: Map<string, FocusSession> = new Map();

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
  };

  sessions.set(session.id, session);
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
      completed
    );
    
    sessions.delete(sessionId);
  }
}

export function canOverride(session: FocusSession): boolean {
  return true;
}

export function getActiveSession(): FocusSession | null {
  const activeSessions = Array.from(sessions.values());
  return activeSessions.length > 0 ? activeSessions[0] : null;
}
