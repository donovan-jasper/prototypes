import { useState, useEffect } from 'react';
import { scheduleVoicePrompt, cancelAllPrompts, getScheduledPrompts, updatePromptSchedule as updateSchedule } from '../services/notifications';
import { useAudio } from './useAudio';

interface Prompt {
  id: string;
  title: string;
  time: { hour: number; minute: number };
  enabled: boolean;
  clip: {
    id: string;
    title: string;
    category: string;
    audioFile: string;
    duration: number;
    intensity: string;
    isPremium: boolean;
  };
}

export const useVoicePrompts = () => {
  const [scheduledPrompts, setScheduledPrompts] = useState<Prompt[]>([]);
  const { playAudio } = useAudio();

  useEffect(() => {
    const loadScheduledPrompts = async () => {
      const prompts = await getScheduledPrompts();
      setScheduledPrompts(prompts);
    };

    loadScheduledPrompts();
  }, []);

  const schedulePrompt = async (prompt: Omit<Prompt, 'id'>) => {
    const promptId = await scheduleVoicePrompt(prompt);
    setScheduledPrompts([...scheduledPrompts, { ...prompt, id: promptId }]);
  };

  const updatePromptSchedule = async (promptId: string, updates: Partial<Prompt>) => {
    const updatedPrompts = scheduledPrompts.map((prompt) =>
      prompt.id === promptId ? { ...prompt, ...updates } : prompt
    );
    setScheduledPrompts(updatedPrompts);
    await updateSchedule(promptId, updates);
  };

  const playPrompt = async (promptId: string) => {
    const prompt = scheduledPrompts.find((p) => p.id === promptId);
    if (prompt) {
      await playAudio(prompt.clip.audioFile);
    }
  };

  return { scheduledPrompts, schedulePrompt, updatePromptSchedule, playPrompt };
};
