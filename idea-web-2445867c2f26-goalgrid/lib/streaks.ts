import { Completion } from './types';

export function calculateStreak(completions: Completion[]): number {
  if (completions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Sort completions by date descending
  const sortedCompletions = [...completions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Check if today is completed
  const todayCompletion = sortedCompletions.find(c => {
    const completionDate = new Date(c.date);
    return completionDate.toDateString() === today.toDateString();
  });

  if (todayCompletion?.completed) {
    streak = 1;
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1);

    for (const completion of sortedCompletions) {
      const completionDate = new Date(completion.date);
      if (completionDate.toDateString() === currentDate.toDateString()) {
        if (completion.completed) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  return streak;
}

export function getLongestStreak(completions: Completion[]): number {
  if (completions.length === 0) return 0;

  let longestStreak = 0;
  let currentStreak = 0;

  // Sort completions by date ascending
  const sortedCompletions = [...completions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  for (const completion of sortedCompletions) {
    if (completion.completed) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

export function calculateCompletionRate(completions: Completion[]): number {
  if (completions.length === 0) return 0;

  const completedCount = completions.filter(c => c.completed).length;
  return (completedCount / completions.length) * 100;
}

export function getStreakStatus(completions: Completion[]): 'active' | 'at-risk' | 'broken' {
  if (completions.length === 0) return 'broken';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if today is completed
  const todayCompletion = completions.find(c => {
    const completionDate = new Date(c.date);
    return completionDate.toDateString() === today.toDateString();
  });

  if (todayCompletion?.completed) {
    return 'active';
  }

  // Check if yesterday was completed
  const yesterdayCompletion = completions.find(c => {
    const completionDate = new Date(c.date);
    return completionDate.toDateString() === yesterday.toDateString();
  });

  if (yesterdayCompletion?.completed) {
    return 'at-risk';
  }

  return 'broken';
}

export function getMissedDays(completions: Completion[]): number {
  if (completions.length === 0) return 0;

  const today = new Date();
  const lastCompletion = completions.reduce((latest, current) => {
    const currentDate = new Date(current.date);
    const latestDate = new Date(latest.date);
    return currentDate > latestDate ? current : latest;
  });

  const lastCompletionDate = new Date(lastCompletion.date);
  const diffTime = Math.abs(today.getTime() - lastCompletionDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays - 1; // Subtract 1 because we don't count the last completion day
}
