import { VoiceClip } from '../types';

const voiceClips: VoiceClip[] = [
  // Morning clips
  {
    id: 'morning-1',
    title: 'Morning Boost',
    category: 'morning',
    audioFile: 'morning-boost-01.mp3',
    duration: 45,
    intensity: 'moderate',
    isPremium: false,
  },
  {
    id: 'morning-2',
    title: 'Sunrise Energy',
    category: 'morning',
    audioFile: 'morning-energy-01.mp3',
    duration: 50,
    intensity: 'energetic',
    isPremium: true,
  },
  // Focus clips
  {
    id: 'focus-1',
    title: 'Deep Focus',
    category: 'focus',
    audioFile: 'focus-deep-01.mp3',
    duration: 40,
    intensity: 'moderate',
    isPremium: false,
  },
  {
    id: 'focus-2',
    title: 'Productivity Push',
    category: 'focus',
    audioFile: 'focus-productivity-01.mp3',
    duration: 45,
    intensity: 'energetic',
    isPremium: true,
  },
  // Energy clips
  {
    id: 'energy-1',
    title: 'Energy Surge',
    category: 'energy',
    audioFile: 'energy-surge-01.mp3',
    duration: 35,
    intensity: 'energetic',
    isPremium: false,
  },
  {
    id: 'energy-2',
    title: 'Power Hour',
    category: 'energy',
    audioFile: 'energy-power-01.mp3',
    duration: 50,
    intensity: 'energetic',
    isPremium: true,
  },
  // Calm clips
  {
    id: 'calm-1',
    title: 'Calm Mind',
    category: 'calm',
    audioFile: 'calm-mind-01.mp3',
    duration: 40,
    intensity: 'gentle',
    isPremium: false,
  },
  {
    id: 'calm-2',
    title: 'Peaceful Moment',
    category: 'calm',
    audioFile: 'calm-peaceful-01.mp3',
    duration: 45,
    intensity: 'gentle',
    isPremium: true,
  },
  // Celebrate clips
  {
    id: 'celebrate-1',
    title: 'Small Win',
    category: 'celebrate',
    audioFile: 'celebrate-win-01.mp3',
    duration: 30,
    intensity: 'moderate',
    isPremium: false,
  },
  {
    id: 'celebrate-2',
    title: 'Big Achievement',
    category: 'celebrate',
    audioFile: 'celebrate-big-01.mp3',
    duration: 40,
    intensity: 'energetic',
    isPremium: true,
  },
];

export const getVoiceClipsByCategory = (category: string): VoiceClip[] => {
  if (category === 'all') return voiceClips;
  return voiceClips.filter(clip => clip.category === category);
};

export const getClipsByMood = (mood: string): VoiceClip[] => {
  const intensityMap: Record<string, string> = {
    struggling: 'gentle',
    neutral: 'moderate',
    crushing: 'energetic',
  };

  return voiceClips.filter(clip => clip.intensity === intensityMap[mood]);
};

export const getRandomClip = (category?: string, excludeIds: string[] = []): VoiceClip => {
  const filteredClips = category
    ? getVoiceClipsByCategory(category).filter(clip => !excludeIds.includes(clip.id))
    : voiceClips.filter(clip => !excludeIds.includes(clip.id));

  if (filteredClips.length === 0) {
    return voiceClips[0]; // Fallback
  }

  const randomIndex = Math.floor(Math.random() * filteredClips.length);
  return filteredClips[randomIndex];
};

export const getClipsByCategoryAndMood = (category: string, mood: string): VoiceClip[] => {
  const categoryClips = getVoiceClipsByCategory(category);
  const moodClips = getClipsByMood(mood);

  return categoryClips.filter(clip =>
    moodClips.some(moodClip => moodClip.id === clip.id)
  );
};

export const getFreeClips = (): VoiceClip[] => {
  return voiceClips.filter(clip => !clip.isPremium);
};

export const getPremiumClips = (): VoiceClip[] => {
  return voiceClips.filter(clip => clip.isPremium);
};
