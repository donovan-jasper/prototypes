import { OpenAI } from 'openai';
import * as SQLite from 'expo-sqlite';
import { getUserPreferences } from './database';
import { calculateStreak, getLongestStreak, calculateCompletionRate, getStreakStatus } from './streaks';
import { getHabitCompletions } from './habits';
import * as Notifications from 'expo-notifications';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const db = SQLite.openDatabase('streakstack.db');

interface CoachMessageContext {
  streakLength: number;
  longestStreak: number;
  missedDays: number;
  habitName: string;
  completionRate: number;
  status: 'active' | 'at-risk' | 'broken';
  userTone: 'supportive' | 'encouraging' | 'challenging';
}

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

export async function generateCoachMessage(context: CoachMessageContext): Promise<string> {
  // Check cache first
  const cachedMessage = await getCachedMessage(context);
  if (cachedMessage) return cachedMessage;

  try {
    const prompt = `
      You are a supportive habit coach. User has a ${context.streakLength}-day streak
      for ${context.habitName} (longest ${context.longestStreak} days) with a ${context.completionRate}% completion rate.
      Their current streak status is ${context.status}. They've missed ${context.missedDays} days recently.
      Write a ${context.userTone} message (max 50 words) to motivate them, considering their current streak status.
      If their streak is active, praise their progress.
      If their streak is at-risk, encourage them to stay on track.
      If their streak is broken, offer support and encouragement to restart.
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
    // Fallback messages based on streak status
    if (context.status === 'active') {
      return `You're crushing it with your ${context.streakLength}-day streak! Keep going - you're on fire!`;
    } else if (context.status === 'at-risk') {
      return `Your ${context.habitName} streak is at risk! Just one more day to keep it going strong.`;
    } else {
      return `Don't worry about the broken streak. Every expert was once a beginner. Let's get back on track!`;
    }
  }
}

async function getCachedMessage(context: CoachMessageContext): Promise<string | null> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT message FROM ai_messages WHERE streak_length = ? AND longest_streak = ? AND missed_days = ? AND habit_name = ? AND completion_rate = ? AND status = ? AND user_tone = ?',
        [context.streakLength, context.longestStreak, context.missedDays, context.habitName, context.completionRate, context.status, context.userTone],
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
        'INSERT INTO ai_messages (streak_length, longest_streak, missed_days, habit_name, completion_rate, status, user_tone, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [context.streakLength, context.longestStreak, context.missedDays, context.habitName, context.completionRate, context.status, context.userTone, message, new Date().toISOString()],
        () => resolve(),
        (_, error) => {
          console.error('Error caching message:', error);
          resolve();
        }
      );
    });
  });
}

async function getCoachTone(userId: string): Promise<'supportive' | 'encouraging' | 'challenging'> {
  const preferences = await getUserPreferences(userId);
  return preferences?.coachTone || 'supportive';
}

export async function scheduleDailyCoachNotification(userId: string) {
  // Cancel any existing notifications for this user
  await cancelCoachNotifications(userId);

  // Get user's preferred notification time
  const preferences = await getUserPreferences(userId);
  const notificationTime = preferences?.notificationTime || '09:00';

  // Parse time and create notification date
  const [hours, minutes] = notificationTime.split(':').map(Number);
  const now = new Date();
  const notificationDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  // If time has already passed today, schedule for tomorrow
  if (notificationDate < now) {
    notificationDate.setDate(notificationDate.getDate() + 1);
  }

  // Schedule the notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your AI Coach is waiting",
      body: "Check in with your daily motivation message!",
      sound: 'default',
      data: { type: 'coach-checkin', userId },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });

  // Store in database for tracking
  await storeScheduledNotification(userId, notificationDate);
}

async function cancelCoachNotifications(userId: string) {
  // Cancel all notifications with this userId
  await Notifications.cancelAsync();

  // Remove from database
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM scheduled_notifications WHERE user_id = ? AND type = ?',
        [userId, 'coach-checkin'],
        () => resolve(),
        (_, error) => {
          console.error('Error canceling notifications:', error);
          resolve();
        }
      );
    });
  });
}

async function storeScheduledNotification(userId: string, date: Date) {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO scheduled_notifications (user_id, type, scheduled_time) VALUES (?, ?, ?)',
        [userId, 'coach-checkin', date.toISOString()],
        () => resolve(),
        (_, error) => {
          console.error('Error storing notification:', error);
          resolve();
        }
      );
    });
  });
}
