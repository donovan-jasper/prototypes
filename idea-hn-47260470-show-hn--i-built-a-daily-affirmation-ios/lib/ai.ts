import { useStore } from '../store/useStore';

export const generatePersonalizedAffirmation = async (goals: any[], moodHistory: any[]) => {
  const isPremium = useStore.getState().isPremium;

  if (!isPremium) {
    return "This feature unlocks with Premium";
  }

  return "Personalized affirmation";
};
