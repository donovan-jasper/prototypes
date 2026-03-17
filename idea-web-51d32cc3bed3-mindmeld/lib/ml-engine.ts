import { Reminder } from '../types';

interface PatternAnalysis {
  optimalTime: string;
  completionRate: number;
  suggestions: string[];
}

export const analyzePatterns = (reminders: Reminder[]): PatternAnalysis => {
  // Analyze time patterns
  const timeCounts: Record<number, { completed: number; total: number }> = {};

  reminders.forEach(reminder => {
    const date = new Date(reminder.date);
    const hour = date.getHours();

    if (!timeCounts[hour]) {
      timeCounts[hour] = { completed: 0, total: 0 };
    }

    timeCounts[hour].total += 1;
    if (reminder.completed) {
      timeCounts[hour].completed += 1;
    }
  });

  // Find the best time for completing tasks
  let bestTime = 9; // Default to 9 AM
  let highestCompletionRate = 0;

  for (const [hour, counts] of Object.entries(timeCounts)) {
    const completionRate = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;
    if (completionRate > highestCompletionRate) {
      highestCompletionRate = completionRate;
      bestTime = parseInt(hour);
    }
  }

  // Generate suggestions
  const suggestions: string[] = [];

  if (highestCompletionRate > 70) {
    const amPm = bestTime < 12 ? 'AM' : 'PM';
    const displayHour = bestTime % 12 || 12;
    suggestions.push(`You complete tasks most often at ${displayHour}:00 ${amPm}. Consider scheduling new tasks for this time.`);
  }

  // Find tasks that are often forgotten
  const taskCounts: Record<string, { completed: number; total: number }> = {};

  reminders.forEach(reminder => {
    if (!taskCounts[reminder.title]) {
      taskCounts[reminder.title] = { completed: 0, total: 0 };
    }

    taskCounts[reminder.title].total += 1;
    if (reminder.completed) {
      taskCounts[reminder.title].completed += 1;
    }
  });

  for (const [title, counts] of Object.entries(taskCounts)) {
    const completionRate = counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;
    if (completionRate < 50 && counts.total >= 3) {
      suggestions.push(`You often forget to complete "${title}". Consider setting a reminder for this task.`);
    }
  }

  // If no specific patterns found, provide general suggestions
  if (suggestions.length === 0) {
    suggestions.push('Complete more tasks to see personalized suggestions.');
  }

  return {
    optimalTime: `${bestTime}:00`,
    completionRate: highestCompletionRate,
    suggestions,
  };
};

export const predictNextTask = (history: Reminder[]) => {
  if (history.length === 0) return null;

  // Simple prediction: suggest the most frequently completed task
  const taskCounts: Record<string, number> = {};

  history.forEach(reminder => {
    if (reminder.completed) {
      taskCounts[reminder.title] = (taskCounts[reminder.title] || 0) + 1;
    }
  });

  const mostFrequentTask = Object.entries(taskCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (mostFrequentTask) {
    return {
      title: mostFrequentTask,
      confidence: 0.8,
    };
  }

  return null;
};
