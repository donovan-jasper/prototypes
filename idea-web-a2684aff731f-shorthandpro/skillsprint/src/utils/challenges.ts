export const completeChallenge = (challengeType: string, score: number) => {
  // Calculate XP based on challenge type and score
  let xp = 0;
  if (challengeType === 'typing') {
    xp = score * 0.5;
  } else if (challengeType === 'memory') {
    xp = score * 0.3;
  } else if (challengeType === 'math') {
    xp = score * 0.4;
  }

  // Determine if the next level is unlocked
  let unlocked = '';
  if (xp >= 100) {
    unlocked = 'level2';
  }

  return { xp, unlocked };
};
