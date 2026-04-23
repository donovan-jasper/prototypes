import { useState, useEffect, useContext } from 'react';
import { getRandomClip, getClipsByMood } from '../services/voiceLibrary';
import { playVoiceClip } from '../services/audio';
import { SubscriptionContext } from '../context/SubscriptionContext';

export const useVoicePrompts = () => {
  const [promptsToday, setPromptsToday] = useState(0);
  const [promptLimitReached, setPromptLimitReached] = useState(false);
  const [usedClips, setUsedClips] = useState<string[]>([]);
  const { isFeatureUnlocked } = useContext(SubscriptionContext);

  useEffect(() => {
    // Load today's prompt count from storage
    // This would be implemented with AsyncStorage or similar
    const loadPromptCount = async () => {
      // Mock implementation
      setPromptsToday(0);
    };

    loadPromptCount();
  }, []);

  const playRandomPrompt = async (mood?: string) => {
    if (!isFeatureUnlocked('unlimitedPrompts') && promptsToday >= 3) {
      setPromptLimitReached(true);
      return;
    }

    const clips = mood ? getClipsByMood(mood) : getRandomClip();
    const clip = clips.find(c => !usedClips.includes(c.id)) || clips[0];

    if (clip) {
      await playVoiceClip(clip.audioFile);
      setPromptsToday(prev => prev + 1);
      setUsedClips(prev => [...prev, clip.id]);

      // Save to storage
      // await AsyncStorage.setItem('promptsToday', (promptsToday + 1).toString());
    }
  };

  return {
    promptsToday,
    promptLimitReached,
    playRandomPrompt,
  };
};
