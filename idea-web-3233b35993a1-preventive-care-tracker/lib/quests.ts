import { Appointment } from '../types';
import { subDays, isAfter, isBefore, startOfDay, differenceInDays } from 'date-fns';

export function checkQuestCompletion(
  questType: string,
  target: number,
  appointments: Appointment[]
): { completed: boolean; progress: number } {
  if (questType === 'checkups') {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const completedCount = appointments.filter(
      (apt) => apt.completed && isAfter(new Date(apt.date), thirtyDaysAgo)
    ).length;
    
    return {
      completed: completedCount >= target,
      progress: completedCount,
    };
  }
  
  if (questType === 'streak') {
    const streak = calculateStreak(appointments);
    return {
      completed: streak >= target,
      progress: streak,
    };
  }
  
  return { completed: false, progress: 0 };
}

export function calculateStreak(appointments: Appointment[]): number {
  const completedAppointments = appointments
    .filter((apt) => apt.completed)
    .map((apt) => startOfDay(new Date(apt.date)))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completedAppointments.length === 0) return 0;

  let streak = 1;
  const today = startOfDay(new Date());
  
  if (differenceInDays(today, completedAppointments[0]) > 1) {
    return 0;
  }

  for (let i = 0; i < completedAppointments.length - 1; i++) {
    const daysDiff = differenceInDays(
      completedAppointments[i],
      completedAppointments[i + 1]
    );
    
    if (daysDiff === 1) {
      streak++;
    } else if (daysDiff > 1) {
      break;
    }
  }

  return streak;
}

export function updateQuestProgress(
  quests: any[],
  appointments: Appointment[]
): any[] {
  return quests.map((quest) => {
    const { completed, progress } = checkQuestCompletion(
      quest.type,
      quest.target,
      appointments
    );
    
    return {
      ...quest,
      progress,
      completed,
    };
  });
}
