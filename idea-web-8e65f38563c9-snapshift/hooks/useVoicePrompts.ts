import { useState, useEffect, useContext } from 'react';
import { scheduleVoicePrompt, cancelAllPrompts, getScheduledPrompts } from '../services/notifications';
import { getRandomClip } from '../services/voiceLibrary';
import { SubscriptionContext } from '../context/SubscriptionContext';

export const useVoicePrompts = () => {
  const { isFeatureUnlocked } = useContext(SubscriptionContext);
  const [promptsToday, setPromptsToday] = useState(0);
  const [promptLimitReached, setPromptLimitReached] = useState(false);
  const [scheduledPrompts, setScheduledPrompts] = useState<any[]>([]);

  useEffect(() => {
    const loadScheduledPrompts = async () => {
      const prompts = await getScheduledPrompts();
      setScheduledPrompts(prompts);
    };

    loadScheduledPrompts();
  }, []);

  const playRandomPrompt = async () => {
    if (promptLimitReached && !isFeatureUnlocked('unlimitedPrompts')) {
      return false;
    }

    const clip = getRandomClip('all', []);
    if (!clip) return false;

    try {
      await scheduleVoicePrompt({
        title: clip.title,
        body: 'Your motivational prompt is ready!',
        audioFile: clip.audioFile,
        trigger: { seconds: 1 }
      });

      setPromptsToday(prev => prev + 1);
      if (!isFeatureUnlocked('unlimitedPrompts') && promptsToday + 1 >= 3) {
        setPromptLimitReached(true);
      }

      return true;
    } catch (error) {
      console.error('Error playing prompt:', error);
      return false;
    }
  };

  const resetDailyPrompts = () => {
    setPromptsToday(0);
    setPromptLimitReached(false);
  };

  return {
    promptsToday,
    promptLimitReached,
    scheduledPrompts,
    playRandomPrompt,
    resetDailyPrompts
  };
};
