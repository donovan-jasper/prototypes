import { subscriptionTiers } from '../../constants/subscription-tiers';

export const checkUsageLimit = (usage, tier) => {
  const limits = subscriptionTiers[tier];

  if (limits.decompilationsPerMonth !== 'unlimited' &&
      usage.decompilationsThisMonth >= limits.decompilationsPerMonth) {
    return false;
  }

  if (limits.fileSizeLimit !== 'unlimited' &&
      usage.lastFileSize > limits.fileSizeLimit) {
    return false;
  }

  return true;
};

export const canAccessFeature = (feature, tier) => {
  const limits = subscriptionTiers[tier];
  return limits.features.includes(feature);
};
