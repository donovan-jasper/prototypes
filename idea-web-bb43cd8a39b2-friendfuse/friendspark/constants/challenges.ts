export const CHALLENGES = [
  {
    id: 1,
    title: 'Send a text',
    description: 'Send a simple text message to your friend',
    premium: false,
    unlockRequirement: 0,
  },
  {
    id: 2,
    title: 'Share a meme',
    description: 'Share a funny meme with your friend',
    premium: false,
    unlockRequirement: 0,
  },
  {
    id: 3,
    title: 'Record a voice memo',
    description: 'Record a 2-minute voice memo about your week',
    premium: true,
    unlockRequirement: 30,
  },
  // Add more challenges as needed
];

export const getAvailableChallenges = (subscriptionTier, streakLevel) => {
  return CHALLENGES.filter(challenge => {
    if (challenge.premium && subscriptionTier !== 'pro') return false;
    return streakLevel >= challenge.unlockRequirement;
  });
};
