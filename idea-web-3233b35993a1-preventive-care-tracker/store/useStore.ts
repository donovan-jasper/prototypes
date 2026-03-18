import { create } from 'zustand';
import { Appointment, FamilyMember } from '../types';

interface AppState {
  appointments: Appointment[];
  familyMembers: FamilyMember[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  removeAppointment: (id: string) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
}

export const useStore = create<AppState>((set) => ({
  appointments: [],
  familyMembers: [],
  
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [
        ...state.appointments,
        { ...appointment, id: Date.now().toString() } as Appointment,
      ],
    })),
  
  removeAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== id),
    })),
  
  updateAppointment: (id, updatedAppointment) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, ...updatedAppointment } : a
      ),
    })),
  
  addFamilyMember: (member) =>
    set((state) => ({
      familyMembers: [
        ...state.familyMembers,
        { ...member, id: Date.now().toString() },
      ],
    })),
}));
