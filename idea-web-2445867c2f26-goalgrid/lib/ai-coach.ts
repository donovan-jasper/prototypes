import { OpenAI } from 'openai';
import * as SQLite from 'expo-sqlite';
import { getUserPreferences } from './database';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const db = SQLite.openDatabase('streakstack.db');

interface CoachMessageContext {
  streakLength: number;
  missedDays: number;
  habitName: string;
  userTone: 'supportive' | 'encouraging' | 'challenging';
}

export async function generateCoachMessage(context: CoachMessageContext): Promise<string> {
  // Check cache first
  const cachedMessage = await getCachedMessage(context);
  if (cachedMessage) return cachedMessage;

  try {
    const prompt = `
      You are a supportive habit coach. User has a ${context.streakLength}-day streak
      for ${context.habitName} but missed ${context.missedDays} days recently.
      Write a ${context.userTone} message (max 50 words) to motivate them.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });

    const message = completion.choices[0].message.content || "Great job! Keep up the good work!";

    // Cache the message
    await cacheMessage(context, message);

    return message;
  } catch (error) {
    console.error('Error generating coach message:', error);
    return "You're doing great! Keep building your streak!";
  }
}

async function getCachedMessage(context: CoachMessageContext): Promise<string | null> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT message FROM ai_messages WHERE streak_length = ? AND missed_days = ? AND habit_name = ? AND user_tone = ?',
        [context.streakLength, context.missedDays, context.habitName, context.userTone],
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

async function cacheMessage(context: CoachMessageContext, message: string): Promise<void> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO ai_messages (streak_length, missed_days, habit_name, user_tone, message, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [context.streakLength, context.missedDays, context.habitName, context.userTone, message, new Date().toISOString()],
        () => resolve(),
        (_, error) => {
          console.error('Error caching message:', error);
          resolve();
        }
      );
    });
  });
}

export async function getCoachTone(userId: string): Promise<'supportive' | 'encouraging' | 'challenging'> {
  const preferences = await getUserPreferences(userId);
  return preferences?.coachTone || 'supportive';
}
