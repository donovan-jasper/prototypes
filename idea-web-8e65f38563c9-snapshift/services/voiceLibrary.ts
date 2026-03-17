import { VoiceClip } from '../types';

const voiceClips: VoiceClip[] = [
  {
    id: 'morning-boost-01',
    title: 'Morning Boost 1',
    category: 'morning',
    audioFile: 'morning-boost-01.mp3',
    duration: 30,
    intensity: 'moderate',
    isPremium: false,
  },
  {
    id: 'morning-boost-02',
    title: 'Morning Boost 2',
    category: 'morning',
    audioFile: 'morning-boost-02.mp3',
    duration: 30,
    intensity: 'moderate',
    isPremium: false,
  },
  {
    id: 'focus-deep-01',
    title: 'Deep Focus 1',
    category: 'focus',
    audioFile: 'focus-deep-01.mp3',
    duration: 45,
    intensity: 'moderate',
    isPremium: false,
  },
  {
    id: 'focus-deep-02',
    title: 'Deep Focus 2',
    category: 'focus',
    audioFile: 'focus-deep-02.mp3',
    duration: 45,
    intensity: 'moderate',
    isPremium: false,
  },
  {
    id: 'energy-burst-01',
    title: 'Energy Burst 1',
    category: 'energy',
    audioFile: 'energy-burst-01.mp3',
    duration: 30,
    intensity: 'energetic',
    isPremium: false,
  },
  {
    id: 'energy-burst-02',
    title: 'Energy Burst 2',
    category: 'energy',
    audioFile: 'energy-burst-02.mp3',
    duration: 30,
    intensity: 'energetic',
    isPremium: false,
  },
  {
    id: 'calm-down-01',
    title: 'Calm Down 1',
    category: 'calm',
    audioFile: 'calm-down-01.mp3',
    duration: 60,
    intensity: 'gentle',
    isPremium: false,
  },
  {
    id: 'calm-down-02',
    title: 'Calm Down 2',
    category: 'calm',
    audioFile: 'calm-down-02.mp3',
    duration: 60,
    intensity: 'gentle',
    isPremium: false,
  },
  {
    id: 'celebrate-win-01',
    title: 'Celebrate Win 1',
    category: 'celebrate',
    audioFile: 'celebrate-win-01.mp3',
    duration: 45,
    intensity: 'energetic',
    isPremium: false,
  },
  {
    id: 'celebrate-win-02',
    title: 'Celebrate Win 2',
    category: 'celebrate',
    audioFile: 'celebrate-win-02.mp3',
    duration: 45,
    intensity: 'energetic',
    isPremium: false,
  },
  // Premium clips
  {
    id: 'premium-morning-01',
    title: 'Premium Morning Boost',
    category: 'morning',
    audioFile: 'premium-morning-01.mp3',
    duration: 45,
    intensity: 'moderate',
    isPremium: true,
  },
  {
    id: 'premium-focus-01',
    title: 'Premium Deep Focus',
    category: 'focus',
    audioFile: 'premium-focus-01.mp3',
    duration: 60,
    intensity: 'moderate',
    isPremium: true,
  },
  {
    id: 'premium-energy-01',
    title: 'Premium Energy Burst',
    category: 'energy',
    audioFile: 'premium-energy-01.mp3',
    duration: 45,
    intensity: 'energetic',
    isPremium: true,
  },
  {
    id: 'premium-calm-01',
    title: 'Premium Calm Down',
    category: 'calm',
    audioFile: 'premium-calm-01.mp3',
    duration: 90,
    intensity: 'gentle',
    isPremium: true,
  },
  {
    id: 'premium-celebrate-01',
    title: 'Premium Celebration',
    category: 'celebrate',
    audioFile: 'premium-celebrate-01.mp3',
    duration: 60,
    intensity: 'energetic',
    isPremium: true,
  },
];

export const getVoiceClipsByCategory = (category: string) => {
  if (category === 'all') {
    return voiceClips;
  }
  return voiceClips.filter((clip) => clip.category === category);
};

export const getRandomClip = (category: string, excludeIds: string[] = []) => {
  const filteredClips = voiceClips.filter(
    (clip) => clip.category === category && !excludeIds.includes(clip.id)
  );
  const randomIndex = Math.floor(Math.random() * filteredClips.length);
  return filteredClips[randomIndex];
};

export const filterByMood = (mood: string) => {
  let intensity: 'gentle' | 'moderate' | 'energetic' = 'moderate';

  if (mood === 'struggling') {
    intensity = 'gentle';
  } else if (mood === 'crushing') {
    intensity = 'energetic';
  }

  return voiceClips.filter((clip) => clip.intensity === intensity);
};

export const getClipById = (id: string) => {
  return voiceClips.find((clip) => clip.id === id);
};

export const getFreeClips = () => {
  return voiceClips.filter((clip) => !clip.isPremium);
};

export const getPremiumClips = () => {
  return voiceClips.filter((clip) => clip.isPremium);
};
