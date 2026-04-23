import { getUserXP, setUserXP, addChallengeToHistory, updateStreak, ChallengeHistory } from './storage';

export const completeChallenge = async (
  challengeId: string,
  challengeType: string,
  challengeTitle: string,
  score: number
): Promise<{ xp: number; unlocked: string; totalXP: number }> => {
  let xp = 0;
  if (challengeType === 'typing') {
    // Typing challenges earn more XP based on score (WPM + accuracy)
    xp = Math.floor(score * 0.5);
  } else if (challengeType === 'memory') {
    // Memory challenges earn XP based on correct digits
    xp = Math.floor(score * 10);
  } else if (challengeType === 'math') {
    // Math challenges earn XP based on correct answers
    xp = Math.floor(score * 20);
  }

  const currentXP = await getUserXP();
  const newTotalXP = currentXP + xp;
  await setUserXP(newTotalXP);

  const challenge: ChallengeHistory = {
    id: challengeId,
    type: challengeType,
    title: challengeTitle,
    score,
    xp,
    timestamp: Date.now(),
  };
  await addChallengeToHistory(challenge);

  await updateStreak();

  let unlocked = '';
  if (newTotalXP >= 100 && newTotalXP < 200) {
    unlocked = 'level2';
  } else if (newTotalXP >= 200 && newTotalXP < 300) {
    unlocked = 'level3';
  } else if (newTotalXP >= 300) {
    unlocked = 'level4';
  }

  return { xp, unlocked, totalXP: newTotalXP };
};

export const calculateLevel = (xp: number): { level: number; progress: number } => {
  const xpPerLevel = 100;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const progress = (xp % xpPerLevel) / xpPerLevel;
  return { level, progress };
};

export const calculateTypingStats = (typedText: string, targetText: string): { wpm: number; accuracy: number } => {
  const wordsTyped = typedText.trim().split(/\s+/).length;
  const wpm = Math.round((wordsTyped / 1) * 60);

  let errors = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] !== targetText[i]) {
      errors++;
    }
  }

  const accuracy = Math.round(((targetText.length - errors) / targetText.length) * 100);

  return { wpm, accuracy };
};
