import { addMinutes, isWithinInterval, startOfDay, endOfDay, setHours, setMinutes, differenceInMinutes, addDays, isSameDay, parseISO, formatISO } from 'date-fns';
import { Task, ScheduleBlock, TimeSlot, Routine, RoutineCompletion } from '../types';

/**
 * Finds available time slots in a given day, excluding committed time blocks
 */
export function findAvailableSlots(
  date: Date,
  commitments: ScheduleBlock[]
): TimeSlot[] {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  // Filter commitments for the specific date
  const dayCommitments = commitments.filter(commitment =>
    isSameDay(commitment.startTime, date) ||
    isSameDay(commitment.endTime, date) ||
    (commitment.startTime < date && commitment.endTime > addDays(date, 1))
  );

  // Sort commitments by start time
  const sortedCommitments = [...dayCommitments].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  const slots: TimeSlot[] = [];
  let currentTime = dayStart;

  for (const commitment of sortedCommitments) {
    // If there's a gap before this commitment, add it as an available slot
    if (currentTime < commitment.startTime) {
      slots.push({
        start: currentTime,
        end: commitment.startTime,
      });
    }

    // Move current time to end of this commitment
    currentTime = commitment.endTime > currentTime ? commitment.endTime : currentTime;
  }

  // Add remaining time until end of day
  if (currentTime < dayEnd) {
    slots.push({
      start: currentTime,
      end: dayEnd,
    });
  }

  return slots;
}

/**
 * Suggests an optimal time for a task based on priority, duration, and constraints
 */
export function suggestTaskTime(
  task: Task,
  date: Date,
  commitments: ScheduleBlock[],
  energyPatterns?: RoutineCompletion[]
): Date | null {
  const availableSlots = findAvailableSlots(date, commitments);
  const taskDurationMs = task.estimatedMinutes * 60 * 1000;

  // Filter slots that can fit the task
  const viableSlots = availableSlots.filter((slot) => {
    const slotDuration = slot.end.getTime() - slot.start.getTime();
    return slotDuration >= taskDurationMs;
  });

  if (viableSlots.length === 0) {
    return null;
  }

  // Apply time constraints
  let filteredSlots = viableSlots;

  if (task.timeConstraints?.businessHours) {
    filteredSlots = viableSlots.filter((slot) => {
      const startHour = slot.start.getHours();
      const endHour = slot.end.getHours();

      // Business hours: 9am-5pm
      return startHour >= 9 && endHour <= 17;
    });
  }

  if (task.timeConstraints?.preferredTimeWindow) {
    const { start: preferredStart, end: preferredEnd } = task.timeConstraints.preferredTimeWindow;

    filteredSlots = viableSlots.filter((slot) => {
      const slotStartHour = slot.start.getHours();
      const slotEndHour = slot.end.getHours();

      // Check if slot overlaps with preferred window
      return (
        (slotStartHour >= preferredStart && slotStartHour < preferredEnd) ||
        (slotEndHour > preferredStart && slotEndHour <= preferredEnd) ||
        (slotStartHour <= preferredStart && slotEndHour >= preferredEnd)
      );
    });
  }

  // If no slots match constraints, fall back to any viable slot
  const slotsToUse = filteredSlots.length > 0 ? filteredSlots : viableSlots;

  // Priority-based selection
  if (task.priority === 'high') {
    // High priority: suggest earliest available time
    return slotsToUse[0].start;
  } else if (task.priority === 'medium') {
    // Medium priority: suggest middle of day if available
    const middaySlot = slotsToUse.find((slot) => {
      const hour = slot.start.getHours();
      return hour >= 11 && hour <= 14;
    });
    return middaySlot ? middaySlot.start : slotsToUse[0].start;
  } else {
    // Low priority: suggest later in the day
    const afternoonSlot = slotsToUse.find((slot) => {
      const hour = slot.start.getHours();
      return hour >= 15;
    });
    return afternoonSlot ? afternoonSlot.start : slotsToUse[slotsToUse.length - 1].start;
  }
}

/**
 * Adapts a routine's timing to fit around schedule commitments
 */
export function adaptRoutine(
  routine: Routine,
  schedule: ScheduleBlock[],
  date: Date = new Date()
): Date | null {
  if (!routine.flexible || !routine.preferredTimeWindow) {
    return null;
  }

  const { start: preferredStart, end: preferredEnd } = routine.preferredTimeWindow;

  // Create a time window for the preferred routine time
  const windowStart = setMinutes(setHours(date, preferredStart), 0);
  const windowEnd = setMinutes(setHours(date, preferredEnd), 0);

  // Find available slots within the preferred window
  const availableSlots = findAvailableSlots(date, schedule);

  const slotsInWindow = availableSlots.filter((slot) => {
    // Check if slot overlaps with preferred window
    return (
      isWithinInterval(slot.start, { start: windowStart, end: windowEnd }) ||
      isWithinInterval(slot.end, { start: windowStart, end: windowEnd }) ||
      (slot.start <= windowStart && slot.end >= windowEnd)
    );
  });

  if (slotsInWindow.length === 0) {
    // No available slots in preferred window, find closest alternative
    const allSlots = [...availableSlots].sort((a, b) => {
      const aDistance = Math.min(
        Math.abs(a.start.getTime() - windowStart.getTime()),
        Math.abs(a.end.getTime() - windowEnd.getTime())
      );
      const bDistance = Math.min(
        Math.abs(b.start.getTime() - windowStart.getTime()),
        Math.abs(b.end.getTime() - windowEnd.getTime())
      );
      return aDistance - bDistance;
    });

    return allSlots.length > 0 ? allSlots[0].start : null;
  }

  // Find the slot that best fits the routine duration
  const routineDuration = routine.tasks.length * 15; // Assuming 15 minutes per task
  const bestSlot = slotsInWindow.find((slot) => {
    const slotDuration = differenceInMinutes(slot.end, slot.start);
    return slotDuration >= routineDuration;
  });

  return bestSlot ? bestSlot.start : slotsInWindow[0].start;
}

/**
 * Calculates energy score based on completion history
 */
export function calculateEnergyScore(
  completions: RoutineCompletion[],
  date: Date = new Date()
): number {
  if (completions.length === 0) return 0.5; // Neutral score if no data

  // Filter completions from the same day of week
  const dayOfWeek = date.getDay();
  const sameDayCompletions = completions.filter((comp) => {
    return comp.completedAt.getDay() === dayOfWeek;
  });

  if (sameDayCompletions.length === 0) return 0.5;

  // Calculate average completion time
  const totalMinutes = sameDayCompletions.reduce((sum, comp) => {
    return sum + comp.completedAt.getHours() * 60 + comp.completedAt.getMinutes();
  }, 0);

  const avgMinutes = totalMinutes / sameDayCompletions.length;
  const avgHour = Math.floor(avgMinutes / 60);

  // Score based on time of day (0-1 scale)
  if (avgHour >= 6 && avgHour < 12) return 0.9; // Morning
  if (avgHour >= 12 && avgHour < 18) return 0.7; // Afternoon
  if (avgHour >= 18 && avgHour < 22) return 0.5; // Evening
  return 0.3; // Night
}
