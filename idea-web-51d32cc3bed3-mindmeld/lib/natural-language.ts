import { format, parse, isValid, addDays, addWeeks, addMonths } from 'date-fns';

interface ParsedReminder {
  title: string;
  date: Date;
  time: Date;
  location?: string;
  category?: 'personal' | 'work' | 'health' | 'finance' | 'other';
}

export function parseNaturalLanguage(input: string): ParsedReminder {
  // Initialize with default values
  const now = new Date();
  const result: ParsedReminder = {
    title: '',
    date: now,
    time: now,
  };

  // Convert to lowercase for easier processing
  const lowerInput = input.toLowerCase();

  // Extract date/time information
  const dateTimeMatch = lowerInput.match(
    /(tomorrow|today|next week|next month|in \d+ days|in \d+ weeks|in \d+ months|on \w+ \d+|at \d+:\d+ [ap]m)/g
  );

  if (dateTimeMatch) {
    dateTimeMatch.forEach(match => {
      if (match.includes('tomorrow')) {
        result.date = addDays(now, 1);
      } else if (match.includes('next week')) {
        result.date = addWeeks(now, 1);
      } else if (match.includes('next month')) {
        result.date = addMonths(now, 1);
      } else if (match.includes('in ')) {
        const daysMatch = match.match(/in (\d+) days/);
        const weeksMatch = match.match(/in (\d+) weeks/);
        const monthsMatch = match.match(/in (\d+) months/);

        if (daysMatch) {
          result.date = addDays(now, parseInt(daysMatch[1]));
        } else if (weeksMatch) {
          result.date = addWeeks(now, parseInt(weeksMatch[1]));
        } else if (monthsMatch) {
          result.date = addMonths(now, parseInt(monthsMatch[1]));
        }
      } else if (match.includes('on ')) {
        // Simple date parsing (e.g., "on Monday")
        // In a real app, you'd want more robust date parsing
        const dateStr = match.replace('on ', '');
        const parsedDate = parse(dateStr, 'EEEE', now);
        if (isValid(parsedDate)) {
          result.date = parsedDate;
        }
      } else if (match.includes('at ')) {
        // Time parsing (e.g., "at 3pm")
        const timeStr = match.replace('at ', '');
        const parsedTime = parse(timeStr, 'h:mm a', now);
        if (isValid(parsedTime)) {
          result.time = parsedTime;
        }
      }
    });
  }

  // Extract location
  const locationMatch = lowerInput.match(/(near|at|in) (.+?)(?= at \d+:\d+|$)/);
  if (locationMatch) {
    result.location = locationMatch[2].trim();
  }

  // Extract category
  const categoryKeywords = {
    'work': ['work', 'meeting', 'project', 'office', 'job'],
    'personal': ['personal', 'family', 'mom', 'dad', 'friend', 'social'],
    'health': ['health', 'exercise', 'gym', 'doctor', 'medication'],
    'finance': ['finance', 'bill', 'payment', 'bank', 'money'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      result.category = category as any;
      break;
    }
  }

  // Extract title - everything after "remind me to" or similar
  const titleMatch = input.match(/(?:remind me to|remind me|remind|set a reminder to|create a reminder to) (.+)/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  } else {
    // Fallback to the entire input if no clear command found
    result.title = input.trim();
  }

  return result;
}
