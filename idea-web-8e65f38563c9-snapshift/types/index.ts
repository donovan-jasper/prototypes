export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface VoiceClip {
  id: string;
  title: string;
  category: 'morning' | 'focus' | 'energy' | 'calm' | 'celebrate';
  audioFile: string;
  duration: number;
  intensity: 'gentle' | 'moderate' | 'energetic';
  isPremium: boolean;
}

export interface PromptSchedule {
  id: string;
  time: { hour: number; minute: number };
  enabled: boolean;
  clipId?: string;
}

export type Mood = 'struggling' | 'neutral' | 'crushing';
