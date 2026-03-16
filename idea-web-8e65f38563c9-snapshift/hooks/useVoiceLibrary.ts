import { useState, useEffect } from 'react';
import { getVoiceClipsByCategory, getRandomClip, filterByMood } from '../services/voiceLibrary';
import { useAudio } from './useAudio';

interface VoiceClip {
  id: string;
  title: string;
  category: string;
  audioFile: string;
  duration: number;
  intensity: string;
  isPremium: boolean;
}

export const useVoiceLibrary = () => {
  const [voiceClips, setVoiceClips] = useState<VoiceClip[]>([]);
  const { playAudio } = useAudio();

  useEffect(() => {
    const loadVoiceClips = async () => {
      const clips = await getVoiceClipsByCategory('all');
      setVoiceClips(clips);
    };

    loadVoiceClips();
  }, []);

  const playClip = async (clipId: string) => {
    const clip = voiceClips.find((c) => c.id === clipId);
    if (clip) {
      await playAudio(clip.audioFile);
    }
  };

  const getClipsByCategory = (category: string) => {
    return voiceClips.filter((clip) => clip.category === category);
  };

  const getClipsByMood = (mood: string) => {
    return filterByMood(mood);
  };

  return { voiceClips, playClip, getClipsByCategory, getClipsByMood };
};
