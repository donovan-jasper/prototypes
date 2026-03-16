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
  // Add more voice clips here
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
