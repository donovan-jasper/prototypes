import { parse, isValid, addDays, addWeeks, addMonths } from 'date-fns';

interface ParsedReminder {
  title: string;
  date: Date;
  time: Date;
  location?: string;
  category?: string;
}

export function parseNaturalLanguage(text: string): ParsedReminder {
  const lowerText = text.toLowerCase();
  const now = new Date();
  let date = new Date(now);
  let time = new Date(now);
  let title = '';
  let location: string | undefined;
  let category: string | undefined;

  // Extract date/time
  const dateRegex = /(tomorrow|today|next week|in \d+ days|at \d+:\d+|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday)/;
  const dateMatch = lowerText.match(dateRegex);

  if (dateMatch) {
    const matchText = dateMatch[0];

    if (matchText.includes('tomorrow')) {
      date = addDays(now, 1);
    } else if (matchText.includes('next week')) {
      date = addDays(now, 7);
    } else if (matchText.includes('in ')) {
      const days = parseInt(matchText.split(' ')[1]);
      date = addDays(now, days);
    } else if (matchText.includes('next ')) {
      const dayMap: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0
      };
      const dayName = matchText.split(' ')[1];
      const targetDay = dayMap[dayName];
      const currentDay = now.getDay();

      let daysToAdd = (targetDay - currentDay + 7) % 7;
      if (daysToAdd === 0) daysToAdd = 7; // If it's the same day, set for next week
      date = addDays(now, daysToAdd);
    }

    const timeRegex = /at (\d+):(\d+)/;
    const timeMatch = lowerText.match(timeRegex);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      time.setHours(hours, minutes);
    }
  }

  // Extract location
  const locationRegex = /near (.*?)(?= at|$)/;
  const locationMatch = lowerText.match(locationRegex);
  if (locationMatch) {
    location = locationMatch[1];
  }

  // Extract category
  const categoryKeywords: Record<string, string> = {
    'work': 'work',
    'meeting': 'work',
    'project': 'work',
    'call': 'personal',
    'mom': 'personal',
    'dad': 'personal',
    'medication': 'health',
    'exercise': 'health',
    'gym': 'health',
    'bill': 'finance',
    'payment': 'finance',
    'appointment': 'health'
  };

  for (const [keyword, cat] of Object.entries(categoryKeywords)) {
    if (lowerText.includes(keyword)) {
      category = cat;
      break;
    }
  }

  // Extract title - remove date/time/location parts
  let titleText = text;
  if (dateMatch) {
    titleText = titleText.replace(dateMatch[0], '');
  }
  if (locationMatch) {
    titleText = titleText.replace(locationMatch[0], '');
  }

  // Clean up the title
  title = titleText
    .replace(/remind me to?/i, '')
    .replace(/please/i, '')
    .replace(/at \d+:\d+/i, '')
    .replace(/near .*/i, '')
    .trim();

  return {
    title,
    date,
    time,
    location,
    category
  };
}
