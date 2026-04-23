import { Broadcast } from '../types';
import { Coordinates, calculateDistance } from './location';

export function filterByRadius(
  broadcasts: Broadcast[],
  userLocation: Coordinates,
  radiusMiles: number
): Broadcast[] {
  return broadcasts.filter((broadcast) => {
    const distance = calculateDistance(
      userLocation,
      { lat: broadcast.lat, lng: broadcast.lng }
    );
    return distance <= radiusMiles;
  });
}

export function rankMatches(broadcasts: Broadcast[]): Broadcast[] {
  return [...broadcasts].sort((a, b) => {
    // Premium users get boosted higher
    const premiumBoostA = a.isPremium ? -1 : 0;
    const premiumBoostB = b.isPremium ? -1 : 0;

    // Sort by distance first (closer is better)
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }

    // Then by recency (newer is better)
    const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    // Apply premium boost if needed
    if (premiumBoostA !== premiumBoostB) {
      return premiumBoostA - premiumBoostB;
    }

    return timeDiff;
  });
}

export function applyPremiumBoost(broadcasts: Broadcast[]): Broadcast[] {
  return broadcasts.map((broadcast) => ({
    ...broadcast,
    // Premium broadcasts get their distance reduced by 20%
    distance: broadcast.isPremium ? broadcast.distance * 0.8 : broadcast.distance,
  }));
}

export function getFilteredAndRankedBroadcasts(
  broadcasts: Broadcast[],
  userLocation: Coordinates,
  radiusMiles: number
): Broadcast[] {
  const filtered = filterByRadius(broadcasts, userLocation, radiusMiles);
  const withBoost = applyPremiumBoost(filtered);
  return rankMatches(withBoost);
}
