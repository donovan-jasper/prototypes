import {
  createSession as dbCreateSession,
  updateSessionStatus,
  updateSessionEnergyRating,
  getSession as dbGetSession,
  getAllSessions as dbGetAllSessions,
  getCompletedSessions as dbGetCompletedSessions,
} from '../database/queries';
import { SessionRecord } from '../database/schema';
import { cueScheduler } from './cueScheduler';

export interface Session {
  id: string;
  durationMinutes: number;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'interrupted';
  energyRating?: number;
  soundscapeId?: string;
}

class SessionManager {
  async createSession(durationMinutes: number, soundscapeId?: string): Promise<Session> {
    const id = Date.now().toString();
    await dbCreateSession(id, durationMinutes, soundscapeId || null);

    const session: Session = {
      id,
      durationMinutes,
      startTime: Date.now(),
      status: 'pending',
      soundscapeId,
    };

    return session;
  }

  async startSession(sessionId: string): Promise<Session | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    // Initialize cue scheduler with the session
    cueScheduler.initialize(session);

    await updateSessionStatus(sessionId, 'active');
    const updatedSession = await this.getSession(sessionId);

    if (updatedSession) {
      // Start the cue scheduler
      cueScheduler.start();
    }

    return updatedSession;
  }

  async pauseSession(sessionId: string): Promise<Session | null> {
    await updateSessionStatus(sessionId, 'paused');
    cueScheduler.pause();
    return this.getSession(sessionId);
  }

  async resumeSession(sessionId: string): Promise<Session | null> {
    await updateSessionStatus(sessionId, 'active');
    cueScheduler.resume();
    return this.getSession(sessionId);
  }

  async completeSession(sessionId: string, energyRating: number): Promise<Session | null> {
    const endTime = Date.now();
    await updateSessionStatus(sessionId, 'completed', endTime);
    await updateSessionEnergyRating(sessionId, energyRating);
    cueScheduler.stop();
    return this.getSession(sessionId);
  }

  async interruptSession(sessionId: string): Promise<Session | null> {
    const endTime = Date.now();
    await updateSessionStatus(sessionId, 'interrupted', endTime);
    cueScheduler.stop();
    return this.getSession(sessionId);
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const record = await dbGetSession(sessionId);
    if (!record) return null;

    return this.recordToSession(record);
  }

  async getAllSessions(): Promise<Session[]> {
    const records = await dbGetAllSessions();
    return records.map(r => this.recordToSession(r));
  }

  async getCompletedSessions(): Promise<Session[]> {
    const records = await dbGetCompletedSessions();
    return records.map(r => this.recordToSession(r));
  }

  private recordToSession(record: SessionRecord): Session {
    return {
      id: record.id,
      durationMinutes: record.duration_minutes,
      startTime: record.start_time,
      endTime: record.end_time || undefined,
      status: record.status,
      energyRating: record.energy_rating || undefined,
      soundscapeId: record.soundscape_id || undefined,
    };
  }
}

export const sessionManager = new SessionManager();
export type { Session };
