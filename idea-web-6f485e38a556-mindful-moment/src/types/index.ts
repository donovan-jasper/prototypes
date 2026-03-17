export interface Moment {
  id: string;
  category: 'Calm' | 'Focus' | 'Energy' | 'Perspective' | 'Gratitude';
  title: string;
  description: string;
  script: string;
  duration: number;
  audioPath?: string;
  voiceType?: string;
  isPremium: boolean;
}

export interface User {
  id: string;
  createdAt: Date;
  isPremium: boolean;
  onboardingCompleted: boolean;
}

export interface CompletedMoment {
  id: string;
  momentId: string;
  completedAt: Date;
  moodRating?: number;
  context?: string;
}

export interface Settings {
  id: string;
  quietHoursStart: number;
  quietHoursEnd: number;
  preferredCategories: string[];
  notificationStyle: 'gentle' | 'direct';
  preferredVoice: string;
}

export interface AnalyticsData {
  date: Date;
  momentsTaken: number;
  notificationsSent: number;
  notificationsIgnored: number;
  stressLevel?: number;
}
