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
    // If no slots in preferred window, find earliest available slot
    return availableSlots.length > 0 ? availableSlots[0].start : null;
  }

  // Return the earliest slot within the preferred window
  return slotsInWindow[0].start;
}

/**
 * Calculates energy patterns from task completion history
 */
export function calculateEnergyPatterns(completions: RoutineCompletion[]): {
  peakHours: number[];
  lowEnergyHours: number[];
} {
  if (completions.length === 0) {
    // Default patterns if no data
    return {
      peakHours: [9, 10, 11], // 9am-11am
      lowEnergyHours: [22, 23, 0, 1, 2, 3, 4] // 10pm-4am
    };
  }

  // Group completions by hour
  const hourStats: Record<number, { completed: number; total: number }> = {};

  for (let i = 0; i < 24; i++) {
    hourStats[i] = { completed: 0, total: 0 };
  }

  completions.forEach(completion => {
    const hour = completion.completedAt.getHours();
    hourStats[hour].total++;

    if (completion.status === 'completed') {
      hourStats[hour].completed++;
    }
  });

  // Calculate completion rates
  const completionRates = Object.entries(hourStats).map(([hour, stats]) => ({
    hour: parseInt(hour),
    rate: stats.total > 0 ? stats.completed / stats.total : 0
  }));

  // Sort by completion rate
  const sortedHours = completionRates.sort((a, b) => b.rate - a.rate);

  // Get top 3 peak hours
  const peakHours = sortedHours.slice(0, 3).map(item => item.hour);

  // Get bottom 3 low energy hours
  const lowEnergyHours = sortedHours.slice(-3).map(item => item.hour);

  return { peakHours, lowEnergyHours };
}

/**
 * Suggests optimal times for tasks based on energy patterns
 */
export function suggestEnergyAwareTime(
  task: Task,
  date: Date,
  commitments: ScheduleBlock[],
  energyPatterns: { peakHours: number[]; lowEnergyHours: number[] }
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

  // Apply energy-aware selection
  if (task.priority === 'high') {
    // High priority: prefer peak hours
    const peakSlot = viableSlots.find(slot =>
      energyPatterns.peakHours.includes(slot.start.getHours())
    );
    return peakSlot ? peakSlot.start : viableSlots[0].start;
  } else if (task.priority === 'medium') {
    // Medium priority: avoid low energy hours
    const nonLowEnergySlots = viableSlots.filter(slot =>
      !energyPatterns.lowEnergyHours.includes(slot.start.getHours())
    );
    return nonLowEnergySlots.length > 0 ? nonLowEnergySlots[0].start : viableSlots[0].start;
  } else {
    // Low priority: prefer low energy hours
    const lowEnergySlot = viableSlots.find(slot =>
      energyPatterns.lowEnergyHours.includes(slot.start.getHours())
    );
    return lowEnergySlot ? lowEnergySlot.start : viableSlots[viableSlots.length - 1].start;
  }
}

/**
 * Finds the best day to schedule a task based on schedule availability
 */
export function findBestDayForTask(
  task: Task,
  startDate: Date,
  endDate: Date,
  commitments: ScheduleBlock[]
): Date | null {
  let currentDate = startOfDay(startDate);
  const endDay = endOfDay(endDate);
  let bestDate: Date | null = null;
  let bestScore = -Infinity;

  while (currentDate <= endDay) {
    const availableSlots = findAvailableSlots(currentDate, commitments);
    const taskDurationMs = task.estimatedMinutes * 60 * 1000;

    // Find slots that can fit the task
    const viableSlots = availableSlots.filter((slot) => {
      const slotDuration = slot.end.getTime() - slot.start.getTime();
      return slotDuration >= taskDurationMs;
    });

    if (viableSlots.length > 0) {
      // Score this day based on:
      // 1. Number of available slots
      // 2. Proximity to today (earlier is better)
      const daysFromToday = differenceInMinutes(currentDate, new Date()) / (24 * 60);

      // Higher score is better
      const score = viableSlots.length - (daysFromToday * 0.1);

      if (score > bestScore) {
        bestScore = score;
        bestDate = currentDate;
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return bestDate;
}
