import {
  createSession as dbCreateSession,
  updateSessionStatus,
  updateSessionEnergyRating,
  getSession as dbGetSession,
  getAllSessions as dbGetAllSessions,
  getCompletedSessions as dbGetCompletedSessions,
} from '../database/queries';
import { SessionRecord } from '../database/schema';

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
    await updateSessionStatus(sessionId, 'active');
    return this.getSession(sessionId);
  }

  async pauseSession(sessionId: string): Promise<Session | null> {
    await updateSessionStatus(sessionId, 'paused');
    return this.getSession(sessionId);
  }

  async resumeSession(sessionId: string): Promise<Session | null> {
    await updateSessionStatus(sessionId, 'active');
    return this.getSession(sessionId);
  }

  async completeSession(sessionId: string, energyRating: number): Promise<Session | null> {
    const endTime = Date.now();
    await updateSessionStatus(sessionId, 'completed', endTime);
    await updateSessionEnergyRating(sessionId, energyRating);
    return this.getSession(sessionId);
  }

  async interruptSession(sessionId: string): Promise<Session | null> {
    const endTime = Date.now();
    await updateSessionStatus(sessionId, 'interrupted', endTime);
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
