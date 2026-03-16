import { getInteractions, getChallenges } from './database';
import { calculateStreaks } from './streaks';

export const calculateFriendshipScore = async (friendId) => {
  const interactions = await getInteractions(friendId);
  const challenges = await getChallenges();

  // Simplified for prototype
  const interactionFrequency = interactions.length / 4; // Assuming 4 weeks
  const interactionVariety = new Set(interactions.map(i => i.type)).size / 3; // 3 possible types
  const challengeCompletion = challenges.filter(c => c.friend_id === friendId && c.status === 'completed').length / 5; // Assuming 5 challenges

  const score = Math.min(100, Math.round((interactionFrequency + interactionVariety + challengeCompletion) * 33.33));

  let status;
  if (score >= 80) status = 'thriving';
  else if (score >= 60) status = 'healthy';
  else if (score >= 40) status = 'needs-attention';
  else status = 'fading';

  return { score, status };
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
    const { score } = await calculateFriendshipScore(friend.id);
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
