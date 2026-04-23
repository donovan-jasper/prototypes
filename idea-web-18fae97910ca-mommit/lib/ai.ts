import { TriggerType } from './types';

interface ParsedMemory {
  title: string;
  description: string;
  triggerType: TriggerType;
  triggerValue: string;
}

export const parseNaturalLanguage = async (input: string): Promise<ParsedMemory> => {
  // In a real implementation, this would call the OpenAI API
  // For this example, we'll use simple pattern matching

  // Default values
  let title = input;
  let description = '';
  let triggerType: TriggerType = 'time';
  let triggerValue = new Date(Date.now() + 86400000).toISOString(); // Default to tomorrow

  // Simple pattern matching for common cases
  if (input.toLowerCase().includes('remind me')) {
    title = input.replace(/remind me to?\s*/i, '').trim();
  }

  // Check for time-based triggers
  const timeRegex = /(at|on|by)\s*([0-9: ]+)/i;
  const timeMatch = input.match(timeRegex);
  if (timeMatch) {
    triggerType = 'time';
    const timeStr = timeMatch[2];

    // Try to parse the time
    try {
      // If it's just a time (e.g., "5 PM"), use today's date
      if (/^[0-9: ]+$/.test(timeStr)) {
        const today = new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);
        today.setHours(hours, minutes || 0, 0, 0);
        triggerValue = today.toISOString();
      } else {
        // Try to parse as full date/time
        triggerValue = new Date(timeStr).toISOString();
      }
    } catch (e) {
      // Fallback to tomorrow if parsing fails
      triggerValue = new Date(Date.now() + 86400000).toISOString();
    }
  }

  // Check for location-based triggers
  const locationRegex = /(near|at|around)\s*(.+)/i;
  const locationMatch = input.match(locationRegex);
  if (locationMatch) {
    triggerType = 'location';
    triggerValue = locationMatch[2].trim();
  }

  // Check for routine-based triggers
  const routineKeywords = ['every', 'each', 'daily', 'weekly', 'monthly'];
  if (routineKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
    triggerType = 'routine';
    // Extract the routine pattern
    const routineMatch = input.match(/(every|each|daily|weekly|monthly)\s*(.+)/i);
    if (routineMatch) {
      triggerValue = routineMatch[2].trim();
    } else {
      triggerValue = 'daily';
    }
  }

  return {
    title,
    description,
    triggerType,
    triggerValue
  };
};

export const generateSuggestions = async (userHistory: Memory[]): Promise<string[]> => {
  // In a real implementation, this would call the OpenAI API
  // For this example, we'll use simple pattern matching

  const suggestions: string[] = [];

  // Check for common patterns in user history
  const timeBasedMemories = userHistory.filter(m => m.trigger_type === 'time');
  if (timeBasedMemories.length > 3) {
    suggestions.push('You often set time-based reminders. Would you like me to suggest some recurring ones?');
  }

  const locationBasedMemories = userHistory.filter(m => m.trigger_type === 'location');
  if (locationBasedMemories.length > 0) {
    suggestions.push('You have location-based reminders. Would you like me to set one for a new location?');
  }

  // Add some generic suggestions
  suggestions.push('Would you like a reminder for your weekly review?');
  suggestions.push('Would you like me to remind you to drink water every hour?');

  return suggestions;
};
