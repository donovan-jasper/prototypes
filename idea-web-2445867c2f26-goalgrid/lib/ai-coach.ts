import { OpenAI } from 'openai';
import * as SQLite from 'expo-sqlite';
import { getUserPreferences } from './database';
import { calculateStreak, getLongestStreak, calculateCompletionRate, getStreakStatus } from './streaks';
import { getHabitCompletions } from './habits';

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
        user_id TEXT,
        habit_id TEXT,
        streak_length INTEGER,
        longest_streak INTEGER,
        missed_days INTEGER,
        habit_name TEXT,
        completion_rate REAL,
        status TEXT,
        user_tone TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// Get the user's preferred coach tone
async function getCoachTone(userId: string): Promise<'supportive' | 'encouraging' | 'challenging'> {
  const preferences = await getUserPreferences(userId);
  return preferences?.coach_tone || 'supportive';
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
    Write a ${context.userTone} message (max 50 words) to motivate them.
  `;
}

// Get a cached message if available
async function getCachedMessage(context: CoachMessageContext): Promise<string | null> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT message FROM ai_messages
         WHERE streak_length = ? AND longest_streak = ? AND missed_days = ? AND habit_name = ?
         AND completion_rate = ? AND status = ? AND user_tone = ?
         ORDER BY created_at DESC LIMIT 1`,
        [
          context.streakLength,
          context.longestStreak,
          context.missedDays,
          context.habitName,
          context.completionRate,
          context.status,
          context.userTone
        ],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0).message);
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

// Cache a generated message
async function cacheMessage(context: CoachMessageContext, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO ai_messages
         (user_id, habit_id, streak_length, longest_streak, missed_days, habit_name, completion_rate, status, user_tone, message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          context.userId,
          context.habitId,
          context.streakLength,
          context.longestStreak,
          context.missedDays,
          context.habitName,
          context.completionRate,
          context.status,
          context.userTone,
          message
        ],
        () => resolve(),
        (_, error) => {
          console.error('Error caching message:', error);
          reject(error);
        }
      );
    });
  });
}

// Get a fallback message when API fails
function getFallbackMessage(context: CoachMessageContext, error: Error | null): string {
  if (context.streakLength > 0) {
    return `You're on a ${context.streakLength}-day streak for ${context.habitName}! Keep it going!`;
  } else if (context.missedDays > 0) {
    return `Don't worry about missing a day. Let's get back on track tomorrow!`;
  }
  return "Great job! Keep up the good work!";
}

// Fetch all coach messages for a user
export async function fetchCoachMessages(userId: string): Promise<CoachMessage[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT id, message, created_at as timestamp, habit_id as habitId
         FROM ai_messages
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId],
        (_, { rows }) => {
          const messages: CoachMessage[] = [];
          for (let i = 0; i < rows.length; i++) {
            messages.push(rows.item(i));
          }
          resolve(messages);
        },
        (_, error) => {
          console.error('Error fetching coach messages:', error);
          reject(error);
        }
      );
    });
  });
}

// Interface for coach messages
interface CoachMessage {
  id: string;
  message: string;
  timestamp: string;
  habitId: string;
}
