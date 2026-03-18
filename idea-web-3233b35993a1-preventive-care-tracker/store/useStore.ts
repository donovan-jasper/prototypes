import { create } from 'zustand';
import { Appointment, FamilyMember, Quest } from '../types';
import { updateQuestProgress } from '../lib/quests';

interface AppState {
  appointments: Appointment[];
  familyMembers: FamilyMember[];
  quests: Quest[];
  totalPoints: number;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  removeAppointment: (id: string) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateQuests: () => void;
}

const initialQuests: Quest[] = [
  {
    id: '1',
    title: 'Complete 3 checkups this month',
    description: 'Schedule and complete 3 medical appointments within 30 days',
    type: 'checkups',
    target: 3,
    progress: 0,
    completed: false,
    points: 100,
  },
  {
    id: '2',
    title: 'Maintain 7-day streak',
    description: 'Complete appointments on 7 consecutive days',
    type: 'streak',
    target: 7,
    progress: 0,
    completed: false,
    points: 150,
  },
  {
    id: '3',
    title: 'Complete 5 checkups this month',
    description: 'Schedule and complete 5 medical appointments within 30 days',
    type: 'checkups',
    target: 5,
    progress: 0,
    completed: false,
    points: 200,
  },
];

export const useStore = create<AppState>((set, get) => ({
  appointments: [],
  familyMembers: [],
  quests: initialQuests,
  totalPoints: 0,
  
  addAppointment: (appointment) => {
    set((state) => ({
      appointments: [
        ...state.appointments,
        { ...appointment, id: Date.now().toString() } as Appointment,
      ],
    }));
    get().updateQuests();
  },
  
  removeAppointment: (id) => {
    set((state) => ({
      appointments: state.appointments.filter((a) => a.id !== id),
    }));
    get().updateQuests();
  },
  
  updateAppointment: (id, updatedAppointment) => {
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, ...updatedAppointment } : a
      ),
    }));
    get().updateQuests();
  },
  
  addFamilyMember: (member) =>
    set((state) => ({
      familyMembers: [
        ...state.familyMembers,
        { ...member, id: Date.now().toString() },
      ],
    })),
  
  updateQuests: () => {
    const { appointments, quests } = get();
    const updatedQuests = updateQuestProgress(quests, appointments);
    
    const newlyCompletedQuests = updatedQuests.filter(
      (quest, index) => quest.completed && !quests[index].completed
    );
    
    const pointsEarned = newlyCompletedQuests.reduce(
      (sum, quest) => sum + quest.points,
      0
    );
    
    set((state) => ({
      quests: updatedQuests,
      totalPoints: state.totalPoints + pointsEarned,
    }));
  },
}));
