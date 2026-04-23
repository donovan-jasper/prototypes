import { VoiceClip } from '../types';

const voiceClips: VoiceClip[] = [
  // Morning clips
  {
    id: 'morning-boost-01',
    title: 'Morning Boost',
    category: 'morning',
    audioFile: 'morning-boost-01.mp3',
    duration: 45,
    intensity: 'moderate',
    isPremium: false
  },
  {
    id: 'morning-boost-02',
    title: 'Sunrise Energy',
    category: 'morning',
    audioFile: 'morning-boost-02.mp3',
    duration: 50,
    intensity: 'energetic',
    isPremium: false
  },
  {
    id: 'morning-boost-03',
    title: 'Fresh Start',
    category: 'morning',
    audioFile: 'morning-boost-03.mp3',
    duration: 48,
    intensity: 'moderate',
    isPremium: true
  },
  {
    id: 'morning-boost-04',
    title: 'Day Ahead',
    category: 'morning',
    audioFile: 'morning-boost-04.mp3',
    duration: 52,
    intensity: 'energetic',
    isPremium: true
  },
  {
    id: 'morning-boost-05',
    title: 'Morning Glow',
    category: 'morning',
    audioFile: 'morning-boost-05.mp3',
    duration: 47,
    intensity: 'moderate',
    isPremium: false
  },

  // Focus clips
  {
    id: 'focus-deep-01',
    title: 'Deep Focus',
    category: 'focus',
    audioFile: 'focus-deep-01.mp3',
    duration: 60,
    intensity: 'moderate',
    isPremium: false
  },
  {
    id: 'focus-deep-02',
    title: 'Concentration Boost',
    category: 'focus',
    audioFile: 'focus-deep-02.mp3',
    duration: 55,
    intensity: 'moderate',
    isPremium: true
  },
  {
    id: 'focus-deep-03',
    title: 'Focus Flow',
    category: 'focus',
    audioFile: 'focus-deep-03.mp3',
    duration: 58,
    intensity: 'moderate',
    isPremium: false
  },
  {
    id: 'focus-deep-04',
    title: 'Mindful Focus',
    category: 'focus',
    audioFile: 'focus-deep-04.mp3',
    duration: 62,
    intensity: 'moderate',
    isPremium: true
  },
  {
    id: 'focus-deep-05',
    title: 'Productivity Pulse',
    category: 'focus',
    audioFile: 'focus-deep-05.mp3',
    duration: 57,
    intensity: 'moderate',
    isPremium: false
  },

  // Energy clips
  {
    id: 'energy-rush-01',
    title: 'Energy Rush',
    category: 'energy',
    audioFile: 'energy-rush-01.mp3',
    duration: 40,
    intensity: 'energetic',
    isPremium: false
  },
  {
    id: 'energy-rush-02',
    title: 'Power Surge',
    category: 'energy',
    audioFile: 'energy-rush-02.mp3',
    duration: 45,
    intensity: 'energetic',
    isPremium: true
  },
  {
    id: 'energy-rush-03',
    title: 'Adrenaline Boost',
    category: 'energy',
    audioFile: 'energy-rush-03.mp3',
    duration: 42,
    intensity: 'energetic',
    isPremium: false
  },
  {
    id: 'energy-rush-04',
    title: 'Vitality Surge',
    category: 'energy',
    audioFile: 'energy-rush-04.mp3',
    duration: 47,
    intensity: 'energetic',
    isPremium: true
  },
  {
    id: 'energy-rush-05',
    title: 'Motivation Spark',
    category: 'energy',
    audioFile: 'energy-rush-05.mp3',
    duration: 43,
    intensity: 'energetic',
    isPremium: false
  },

  // Calm clips
  {
    id: 'calm-mind-01',
    title: 'Calm Your Mind',
    category: 'calm',
    audioFile: 'calm-mind-01.mp3',
    duration: 50,
    intensity: 'gentle',
    isPremium: false
  },
  {
    id: 'calm-mind-02',
    title: 'Peaceful Moment',
    category: 'calm',
    audioFile: 'calm-mind-02.mp3',
    duration: 55,
    intensity: 'gentle',
    isPremium: true
  },
  {
    id: 'calm-mind-03',
    title: 'Tranquil Breath',
    category: 'calm',
    audioFile: 'calm-mind-03.mp3',
    duration: 52,
    intensity: 'gentle',
    isPremium: false
  },
  {
    id: 'calm-mind-04',
    title: 'Serene Pause',
    category: 'calm',
    audioFile: 'calm-mind-04.mp3',
    duration: 58,
    intensity: 'gentle',
    isPremium: true
  },
  {
    id: 'calm-mind-05',
    title: 'Mindful Rest',
    category: 'calm',
    audioFile: 'calm-mind-05.mp3',
    duration: 53,
    intensity: 'gentle',
    isPremium: false
  },

  // Celebrate clips
  {
    id: 'celebrate-win-01',
    title: 'Celebrate Your Win',
    category: 'celebrate',
    audioFile: 'celebrate-win-01.mp3',
    duration: 30,
    intensity: 'energetic',
    isPremium: false
  },
  {
    id: 'celebrate-win-02',
    title: 'Victory Cheer',
    category: 'celebrate',
    audioFile: 'celebrate-win-02.mp3',
    duration: 35,
    intensity: 'energetic',
    isPremium: true
  },
  {
    id: 'celebrate-win-03',
    title: 'Success Celebration',
    category: 'celebrate',
    audioFile: 'celebrate-win-03.mp3',
    duration: 32,
    intensity: 'energetic',
    isPremium: false
  },
  {
    id: 'celebrate-win-04',
    title: 'Achievement Applause',
    category: 'celebrate',
    audioFile: 'celebrate-win-04.mp3',
    duration: 37,
    intensity: 'energetic',
    isPremium: true
  },
  {
    id: 'celebrate-win-05',
    title: 'Triumph Toast',
    category: 'celebrate',
    audioFile: 'celebrate-win-05.mp3',
    duration: 33,
    intensity: 'energetic',
    isPremium: false
  },

  // Additional clips to reach 50+
  {
    id: 'focus-deep-06',
    title: 'Deep Work',
    category: 'focus',
    audioFile: 'focus-deep-06.mp3',
    duration: 59,
    intensity: 'moderate',
    isPremium: false
  },
  {
    id: 'focus-deep-07',
    title: 'Focus Mode',
    category: 'focus',
    audioFile: 'focus-deep-07.mp3',
    duration: 56,
    intensity: 'moderate',
    isPremium: true
  },
  {
    id: 'energy-rush-06',
    title: 'Get Up!',
    category: 'energy',
    audioFile: 'energy-rush-06.mp3',
    duration: 44,
    intensity: 'energetic',
    isPremium: false
  },
  {
    id: 'energy-rush-07',
    title: 'Pump Up',
    category: 'energy',
    audioFile: 'energy-rush-07.mp3',
    duration: 46,
    intensity: 'energetic',
    isPremium: true
  },
  {
    id: 'calm-mind-06',
    title: 'Breathe Easy',
    category: 'calm',
    audioFile: 'calm-mind-06.mp3',
    duration: 51,
    intensity: 'gentle',
    isPremium: false
  },
  {
    id: 'calm-mind-07',
    title: 'Stillness',
    category: 'calm',
    audioFile: 'calm-mind-07.mp3',
    duration: 54,
    intensity: 'gentle',
    isPremium: true
  },
  {
    id: 'celebrate-win-06',
    title: 'You Did It!',
    category: 'celebrate',
    audioFile: 'celebrate-win-06.mp3',
    duration: 31,
    intensity: 'energetic',
    isPremium: false
  },
  {
    id: 'celebrate-win-07',
    title: 'Hooray!',
    category: 'celebrate',
    audioFile: 'celebrate-win-07.mp3',
    duration: 36,
    intensity: 'energetic',
    isPremium: true
  },
  {
    id: 'morning-boost-06',
    title: 'New Day',
    category: 'morning',
    audioFile: 'morning-boost-06.mp3',
    duration: 49,
    intensity: 'moderate',
    isPremium: false
  },
  {
    id: 'morning-boost-07',
    title: 'Rise and Shine',
    category: 'morning',
    audioFile: 'morning-boost-07.mp3',
    duration: 51,
    intensity: 'energetic',
    isPremium: true
  }
];

export const getVoiceClipsByCategory = (category: string): VoiceClip[] => {
  if (category === 'all') return voiceClips;
  return voiceClips.filter(clip => clip.category === category);
};

export const getClipsByCategoryAndMood = (category: string, mood: string): VoiceClip[] => {
  let clips = getVoiceClipsByCategory(category);

  // Filter by mood intensity
  if (mood === 'struggling') {
    clips = clips.filter(clip => clip.intensity === 'gentle');
  } else if (mood === 'crushing') {
    clips = clips.filter(clip => clip.intensity === 'energetic');
  }

  return clips;
};

export const getRandomClip = (category: string, excludeIds: string[] = []): VoiceClip => {
  const clips = getVoiceClipsByCategory(category).filter(clip => !excludeIds.includes(clip.id));
  if (clips.length === 0) {
    // Fallback to any category if no clips available in requested category
    return getRandomClip('all', excludeIds);
  }
  const randomIndex = Math.floor(Math.random() * clips.length);
  return clips[randomIndex];
};

export const getClipById = (id: string): VoiceClip | undefined => {
  return voiceClips.find(clip => clip.id === id);
};

export const getPremiumClips = (): VoiceClip[] => {
  return voiceClips.filter(clip => clip.isPremium);
};

export const getFreeClips = (): VoiceClip[] => {
  return voiceClips.filter(clip => !clip.isPremium);
};

export const getRotatingFreeClips = (count: number = 10): VoiceClip[] => {
  const freeClips = getFreeClips();
  const shuffled = [...freeClips].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
