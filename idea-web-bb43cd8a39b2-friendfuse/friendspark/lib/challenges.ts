import { getChallenges, addChallenge } from './database';

export const getAvailableChallenges = async (friendId, subscriptionTier) => {
  const challenges = await getChallenges();

  // Simplified for prototype
  const availableChallenges = [
    { id: 1, title: 'Send a text', description: 'Send a simple text message to your friend', premium: false },
    { id: 2, title: 'Share a meme', description: 'Share a funny meme with your friend', premium: false },
    { id: 3, title: 'Record a voice memo', description: 'Record a 2-minute voice memo about your week', premium: subscriptionTier === 'pro' },
  ];

  return availableChallenges.filter(challenge => {
    if (challenge.premium && subscriptionTier !== 'pro') return false;
    return !challenges.some(c => c.challenge_type === challenge.title && c.friend_id === friendId);
  });
};

export const startChallenge = async (friendId, challengeType) => {
  const challenge = {
    friend_id: friendId,
    challenge_type: challengeType,
    status: 'active',
  };

  return await addChallenge(challenge);
};
