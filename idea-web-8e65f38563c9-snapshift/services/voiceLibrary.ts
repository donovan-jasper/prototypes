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
  // Add more clips as needed...
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
