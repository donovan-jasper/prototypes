import { format, parse, isValid, addDays, addWeeks, addMonths } from 'date-fns';
import { Reminder } from '../types';

const categoryKeywords = {
  personal: ['mom', 'dad', 'family', 'friend', 'social', 'personal'],
  work: ['meeting', 'project', 'deadline', 'work', 'office', 'job'],
  health: ['exercise', 'workout', 'medication', 'doctor', 'health', 'appointment'],
  finance: ['bill', 'payment', 'bank', 'finance', 'money', 'investment'],
};

const recurrenceKeywords = {
  daily: ['every day', 'daily', 'each day'],
  weekly: ['every week', 'weekly', 'each week'],
  monthly: ['every month', 'monthly', 'each month'],
};

export function parseNaturalLanguage(input: string): {
  title: string;
  date: Date;
  time: Date;
  location?: string;
  category?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
} {
  // Initialize default values
  const now = new Date();
  let title = input;
  let date = now;
  let time = now;
  let location: string | undefined;
  let category: string | undefined;
  let recurrence: 'none' | 'daily' | 'weekly' | 'monthly' = 'none';

  // Extract category
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
      category = cat;
      break;
    }
  }

  // Extract recurrence
  for (const [recur, keywords] of Object.entries(recurrenceKeywords)) {
    if (keywords.some(keyword => input.toLowerCase().includes(keyword))) {
      recurrence = recur as 'daily' | 'weekly' | 'monthly';
      break;
    }
  }

  // Extract date and time
  const dateTimeRegex = /(?:on|at|in)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?(?:\s+\d{1,2})?)(?:\s+at\s+(\d{1,2}:\d{2}\s*[ap]m))?/i;
  const dateTimeMatch = input.match(dateTimeRegex);

  if (dateTimeMatch) {
    const dateStr = dateTimeMatch[1];
    const timeStr = dateTimeMatch[2];

    // Parse date
    if (dateStr) {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const nextWeek = addWeeks(today, 1);

      if (dateStr.toLowerCase() === 'today') {
        date = today;
      } else if (dateStr.toLowerCase() === 'tomorrow') {
        date = tomorrow;
      } else if (dateStr.toLowerCase().includes('next week')) {
        date = nextWeek;
      } else {
        // Try to parse as specific date (e.g., "March 15")
        const parsedDate = parse(dateStr, 'MMMM d', today);
        if (isValid(parsedDate)) {
          date = parsedDate;
        }
      }
    }

    // Parse time
    if (timeStr) {
      const parsedTime = parse(timeStr, 'h:mma', now);
      if (isValid(parsedTime)) {
        time = parsedTime;
      }
    }
  }

  // Extract location
  const locationRegex = /(?:near|at|in)\s+([a-zA-Z\s]+)/i;
  const locationMatch = input.match(locationRegex);
  if (locationMatch) {
    location = locationMatch[1].trim();
  }

  // Extract title (remove date/time/location parts)
  title = input.replace(dateTimeRegex, '').replace(locationRegex, '').trim();

  // Clean up title
  title = title.replace(/^(remind me to|please remind me to|remind me|remind|to)/i, '').trim();

  return {
    title,
    date,
    time,
    location,
    category,
    recurrence,
  };
}
