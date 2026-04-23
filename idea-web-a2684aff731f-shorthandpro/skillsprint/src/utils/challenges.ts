import { getUserXP, setUserXP, addChallengeToHistory, updateStreak, ChallengeHistory } from './storage';

export const completeChallenge = async (
  challengeId: string,
  challengeType: string,
  challengeTitle: string,
  score: number
): Promise<{ xp: number; unlocked: string; totalXP: number }> => {
  let xp = 0;
  if (challengeType === 'typing') {
    xp = Math.floor(score * 0.5);
  } else if (challengeType === 'memory') {
    xp = Math.floor(score * 0.3);
  } else if (challengeType === 'math') {
    xp = Math.floor(score * 0.4);
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
