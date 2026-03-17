import { create } from 'zustand';
import { Waitlist } from '../lib/types';
import db from '../lib/db';

interface WaitlistState {
  waitlists: Waitlist[];
  joinWaitlist: (companyName: string) => void;
  leaveWaitlist: (id: string) => void;
  loadWaitlists: () => void;
}

export const useWaitlistStore = create<WaitlistState>((set) => ({
  waitlists: [],

  joinWaitlist: (companyName) => {
    const id = Date.now().toString();
    db.runSync(
      'INSERT INTO waitlists (id, company_name, participant_count, joined_at) VALUES (?, ?, ?, ?)',
      [id, companyName, 1, new Date().toISOString()]
    );
    set((state) => ({
      waitlists: [
        ...state.waitlists,
        {
          id,
          companyName,
          participantCount: 1,
          joinedAt: new Date()
        }
      ]
    }));
  },

  leaveWaitlist: (id) => {
    db.runSync('DELETE FROM waitlists WHERE id = ?', [id]);
    set((state) => ({
      waitlists: state.waitlists.filter((w) => w.id !== id)
    }));
  },

  loadWaitlists: () => {
    const rows = db.getAllSync('SELECT * FROM waitlists');
    const waitlists = rows.map((row: any) => ({
      id: row.id,
      companyName: row.company_name,
      participantCount: row.participant_count,
      joinedAt: new Date(row.joined_at)
    }));
    set({ waitlists });
  }
}));
