import { create } from 'zustand';
import { ScheduleBlock } from '../types';

interface ScheduleState {
  schedules: ScheduleBlock[];
  addSchedule: (schedule: Omit<ScheduleBlock, 'id'>) => void;
  updateSchedule: (id: string, schedule: Partial<ScheduleBlock>) => void;
  deleteSchedule: (id: string) => void;
  getByDateRange: (start: Date, end: Date) => ScheduleBlock[];
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  
  addSchedule: (schedule) => {
    const newSchedule: ScheduleBlock = {
      ...schedule,
      id: Date.now().toString(),
    };
    set((state) => ({ schedules: [...state.schedules, newSchedule] }));
  },
  
  updateSchedule: (id, updates) => {
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  },
  
  deleteSchedule: (id) => {
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    }));
  },
  
  getByDateRange: (start, end) => {
    return get().schedules.filter((s) => {
      return s.startTime >= start && s.endTime <= end;
    });
  },
}));
