import { getInteractions, getChallenges } from './database';
import { calculateStreaks } from './streaks';
import { differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';

const WEIGHTS = {
  frequency: 0.4,
  variety: 0.3,
  challengeCompletion: 0.3
};

const THRESHOLDS = {
  frequency: {
    weekly: 1,
    monthly: 0.25
  },
  variety: {
    minTypes: 2,
    maxTypes: 3
  },
  challengeCompletion: {
    minRate: 0.2,
    maxRate: 1.0
  }
};

export const calculateExpectedFrequency = (notificationPreference: 'daily' | 'weekly' | 'monthly') => {
  switch (notificationPreference) {
    case 'daily': return 1;
    case 'weekly': return 0.25;
    case 'monthly': return 0.083;
    default: return 0.25; // default to weekly
  }
};

export const calculateFriendshipScore = async (friendId: string, notificationPreference: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
  const interactions = await getInteractions(friendId);
  const challenges = await getChallenges(friendId);

  // Calculate frequency score (0-1)
  const now = new Date();
  const firstInteraction = interactions.length > 0 ? new Date(Math.min(...interactions.map(i => new Date(i.timestamp).getTime()))) : now;
  const daysSinceFirstInteraction = differenceInDays(now, firstInteraction) || 1;

  const expectedFrequency = calculateExpectedFrequency(notificationPreference);
  const actualFrequency = interactions.length / daysSinceFirstInteraction;
  const frequencyScore = Math.min(1, actualFrequency / expectedFrequency);

  // Calculate variety score (0-1)
  const interactionTypes = new Set(interactions.map(i => i.type));
  const varietyScore = interactionTypes.size / THRESHOLDS.variety.maxTypes;

  // Calculate challenge completion score (0-1)
  const completedChallenges = challenges.filter(c => c.status === 'completed').length;
  const totalChallenges = challenges.length;
  const challengeCompletionRate = totalChallenges > 0 ? completedChallenges / totalChallenges : 0;

  // Calculate weighted score (0-100)
  const weightedScore = (
    frequencyScore * WEIGHTS.frequency +
    varietyScore * WEIGHTS.variety +
    challengeCompletionRate * WEIGHTS.challengeCompletion
  ) * 100;

  const score = Math.min(100, Math.round(weightedScore));

  let status;
  if (score >= 80) status = 'thriving';
  else if (score >= 60) status = 'healthy';
  else if (score >= 40) status = 'needs-attention';
  else status = 'fading';

  return {
    score,
    status,
    breakdown: {
      frequency: frequencyScore,
      variety: varietyScore,
      challengeCompletion: challengeCompletionRate
    }
  };
};

export const getAnalyticsSummary = async (friends) => {
  const streaks = await calculateStreaks(friends);
  const totalFriends = friends.length;
  const averageStreak = Math.round(Object.values(streaks).reduce((sum, streak) => sum + (streak?.current || 0), 0) / totalFriends);

  const interactionsThisMonth = friends.reduce(async (total, friend) => {
    const interactions = await getInteractions(friend.id);
    const monthInteractions = interactions.filter(i => {
      const date = new Date(i.timestamp);
      return date.getMonth() === new Date().getMonth();
    });
    return (await total) + monthInteractions.length;
  }, Promise.resolve(0));

  return {
    totalFriends,
    averageStreak,
    interactionsThisMonth: await interactionsThisMonth,
  };
};

export const getFriendsNeedingAttention = async (friends) => {
  const friendsWithScores = await Promise.all(friends.map(async friend => {
    const { score } = await calculateFriendshipScore(friend.id, friend.notificationPreference);
    return { ...friend, score };
  }));

  return friendsWithScores
    .filter(friend => friend.score < 40)
    .sort((a, b) => a.score - b.score);
};

export const getLongestStreaks = async (friends) => {
  const streaks = await calculateStreaks(friends);

  return friends
    .map(friend => ({ ...friend, streak: streaks[friend.id]?.current || 0 }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5);
};
