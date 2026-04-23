import { OpenAI } from 'openai';
import * as SQLite from 'expo-sqlite';
import { getUserPreferences } from './database';
import { calculateStreak, getLongestStreak, calculateCompletionRate, getStreakStatus } from './streaks';
import { getHabitCompletions } from './habits';
import * as Notifications from 'expo-notifications';

// Configuration interface
interface AIConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
  cacheTTL: number; // in milliseconds
}

// Default configuration
const DEFAULT_CONFIG: AIConfig = {
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  model: 'gpt-4o-mini',
  maxRetries: 3,
  cacheTTL: 24 * 60 * 60 * 1000 // 24 hours
};

// Initialize OpenAI client
let openai: OpenAI;
let config: AIConfig = DEFAULT_CONFIG;

// Initialize database
const db = SQLite.openDatabase('streakstack.db');

// Initialize the AI coach
export function initializeAICoach(customConfig?: Partial<AIConfig>) {
  config = { ...DEFAULT_CONFIG, ...customConfig };
  openai = new OpenAI({
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true
  });

  // Create cache table if it doesn't exist
  db.transaction(tx => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        streak_length INTEGER,
        longest_streak INTEGER,
        missed_days INTEGER,
        habit_name TEXT,
        completion_rate REAL,
        status TEXT,
        user_tone TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(streak_length, longest_streak, missed_days, habit_name, completion_rate, status, user_tone)
      );
    `);
  });
}

// Context interface for coach messages
interface CoachMessageContext {
  streakLength: number;
  longestStreak: number;
  missedDays: number;
  habitName: string;
  completionRate: number;
  status: 'active' | 'at-risk' | 'broken';
  userTone: 'supportive' | 'encouraging' | 'challenging';
}

// Fetch context data for generating a coach message
export async function fetchCoachContext(userId: string, habitId: string): Promise<CoachMessageContext> {
  // Get habit completions
  const completions = await getHabitCompletions(habitId);

  // Calculate streak metrics
  const streakLength = calculateStreak(completions);
  const longestStreak = getLongestStreak(completions);
  const completionRate = calculateCompletionRate(completions);
  const status = getStreakStatus(completions);

  // Calculate missed days (days since last completion)
  let missedDays = 0;
  if (completions.length > 0) {
    const lastCompletionDate = new Date(completions[0].date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastCompletionDate.getTime());
    missedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
  }

  // Get user preferences
  const userTone = await getCoachTone(userId);

  // Get habit name
  const habitName = completions.length > 0 ? completions[0].habitName : 'your habit';

  return {
    streakLength,
    longestStreak,
    missedDays,
    habitName,
    completionRate,
    status,
    userTone
  };
}

// Generate a coach message with retry logic and caching
export async function generateCoachMessage(context: CoachMessageContext): Promise<string> {
  // Check cache first
  const cachedMessage = await getCachedMessage(context);
  if (cachedMessage) return cachedMessage;

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      const prompt = buildPrompt(context);
      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      });

      const message = completion.choices[0].message.content || "Great job! Keep up the good work!";

      // Cache the message
      await cacheMessage(context, message);

      return message;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      // Wait before retrying
      if (attempt < config.maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  // If all retries failed, return a fallback message
  console.error('All attempts failed, returning fallback message');
  return getFallbackMessage(context, lastError);
}

// Build the prompt for the AI model
function buildPrompt(context: CoachMessageContext): string {
  return `
    You are a supportive habit coach. User has a ${context.streakLength}-day streak
    for ${context.habitName} (longest ${context.longestStreak} days) with a ${context.completionRate}% completion rate.
    Their current streak status is ${context.status}. They've missed ${context.missedDays} days recently.
    Write a ${context.userTone} message (max 50 words) to motivate them, considering their current streak status.
    If their streak is active, praise their progress.
    If their streak is at-risk, encourage them to stay on track.
    If their streak is broken, offer support and encouragement to restart.
  `;
}

// Get a fallback message when API fails
function getFallbackMessage(context: CoachMessageContext, error: Error | null): string {
  if (error && error.message.includes('429')) {
    // Rate limit error
    return "Your habit coach is busy right now. Check back later for a personalized message!";
  }

  // Default fallback based on streak status
  if (context.status === 'active') {
    return `You're crushing it with your ${context.streakLength}-day streak! Keep going - you're on fire!`;
  } else if (context.status === 'at-risk') {
    return `Your ${context.habitName} streak is at risk! Just one more day to keep it going strong.`;
  } else {
    return `Don't worry about the broken streak. Every expert was once a beginner. Let's get back on track!`;
  }
}

// Get cached message if available and not expired
async function getCachedMessage(context: CoachMessageContext): Promise<string | null> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT message, created_at FROM ai_messages
         WHERE streak_length = ? AND longest_streak = ? AND missed_days = ? AND habit_name = ?
         AND completion_rate = ? AND status = ? AND user_tone = ?`,
        [context.streakLength, context.longestStreak, context.missedDays, context.habitName,
         context.completionRate, context.status, context.userTone],
        (_, { rows }) => {
          if (rows.length > 0) {
            const item = rows.item(0);
            const createdAt = new Date(item.created_at);
            const now = new Date();

            // Check if cache is still valid
            if (now.getTime() - createdAt.getTime() < config.cacheTTL) {
              resolve(item.message);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error fetching cached message:', error);
          resolve(null);
        }
      );
    });
  });
}

// Cache a message in the database
async function cacheMessage(context: CoachMessageContext, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO ai_messages
         (streak_length, longest_streak, missed_days, habit_name, completion_rate, status, user_tone, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [context.streakLength, context.longestStreak, context.missedDays, context.habitName,
         context.completionRate, context.status, context.userTone, message],
        () => resolve(),
        (_, error) => {
          console.error('Error caching message:', error);
          reject(error);
        }
      );
    });
  });
}

// Get the user's preferred coach tone
async function getCoachTone(userId: string): Promise<'supportive' | 'encouraging' | 'challenging'> {
  try {
    const preferences = await getUserPreferences(userId);
    return preferences.coachTone || 'supportive';
  } catch (error) {
    console.error('Error getting coach tone:', error);
    return 'supportive';
  }
}

// Schedule a coach notification
export async function scheduleCoachNotification(userId: string, habitId: string, time: string) {
  try {
    const context = await fetchCoachContext(userId, habitId);
    const message = await generateCoachMessage(context);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your Habit Coach",
        body: message,
        data: { type: 'coach-message', habitId },
      },
      trigger: {
        hour: parseInt(time.split(':')[0]),
        minute: parseInt(time.split(':')[1]),
        repeats: true,
      },
    });
  } catch (error) {
    console.error('Error scheduling coach notification:', error);
  }
}

// Clear expired cache entries
export async function clearExpiredCache() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM ai_messages WHERE created_at < datetime('now', ?)`,
        [`-${config.cacheTTL} milliseconds`],
        () => resolve(true),
        (_, error) => {
          console.error('Error clearing expired cache:', error);
          reject(error);
        }
      );
    });
  });
}

// Initialize the AI coach when this module is imported
initializeAICoach();
