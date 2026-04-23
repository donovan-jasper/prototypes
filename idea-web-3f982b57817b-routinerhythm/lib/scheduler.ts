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
    return null;
  }

  // Find the largest available slot in the preferred window
  const largestSlot = slotsInWindow.reduce((prev, current) => {
    const prevDuration = prev.end.getTime() - prev.start.getTime();
    const currentDuration = current.end.getTime() - current.start.getTime();
    return currentDuration > prevDuration ? current : prev;
  });

  // Calculate how much of the routine can fit in this slot
  const routineDuration = routine.tasks.length * 15 * 60 * 1000; // Assuming 15 min per task
  const slotDuration = largestSlot.end.getTime() - largestSlot.start.getTime();

  if (slotDuration >= routineDuration) {
    // Routine fits in this slot - suggest the start time
    return largestSlot.start;
  } else {
    // Routine doesn't fit - suggest the earliest possible time in the window
    return windowStart;
  }
}

/**
 * Calculates an energy score for each hour of the day based on completion history
 */
export function calculateEnergyScore(
  completions: RoutineCompletion[],
  date: Date = new Date()
): Record<number, number> {
  const energyScores: Record<number, number> = {};

  // Initialize all hours with base score of 50
  for (let hour = 0; hour < 24; hour++) {
    energyScores[hour] = 50;
  }

  // Group completions by hour
  const completionsByHour: Record<number, RoutineCompletion[]> = {};

  completions.forEach(completion => {
    const hour = completion.completedAt.getHours();
    if (!completionsByHour[hour]) {
      completionsByHour[hour] = [];
    }
    completionsByHour[hour].push(completion);
  });

  // Calculate energy score for each hour
  for (const hour in completionsByHour) {
    const hourCompletions = completionsByHour[hour];
    const successfulCompletions = hourCompletions.filter(c => c.successful);
    const successRate = successfulCompletions.length / hourCompletions.length;

    // Adjust score based on success rate
    // 100% success = 100, 0% success = 0
    energyScores[parseInt(hour)] = Math.round(successRate * 100);
  }

  return energyScores;
}

/**
 * Suggests optimal times for all tasks in a queue based on priority and schedule
 */
export function suggestTaskTimes(
  tasks: Task[],
  schedule: ScheduleBlock[],
  date: Date = new Date(),
  energyPatterns?: RoutineCompletion[]
): Record<string, Date | null> {
  const suggestions: Record<string, Date | null> = {};

  // Sort tasks by priority (high to low)
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Create a working copy of the schedule to track allocations
  const allocatedSchedule = [...schedule];

  for (const task of sortedTasks) {
    // Find the best time for this task
    const suggestedTime = suggestTaskTime(task, date, allocatedSchedule, energyPatterns);

    if (suggestedTime) {
      // Add this task to the schedule to block that time for other tasks
      const taskEndTime = addMinutes(suggestedTime, task.estimatedMinutes);
      allocatedSchedule.push({
        id: `task-${task.id}`,
        title: task.title,
        startTime: suggestedTime,
        endTime: taskEndTime,
        type: 'task',
      });
    }

    suggestions[task.id] = suggestedTime;
  }

  return suggestions;
}
