import { calculateCompatibilityScore } from '../utils/compatibility';

export const getMatchSuggestions = (currentUser, allUsers, limit = 10) => {
  const matches = allUsers
    .filter(user => user.id !== currentUser.id)
    .map(user => ({
      ...user,
      compatibilityScore: calculateCompatibilityScore(currentUser, user),
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);

  return matches;
};

export const filterByDistance = (users, location, maxMiles) => {
  const earthRadius = 3959; // miles
  const { lat: lat1, lon: lon1 } = location;

  return users.filter(user => {
    const { lat: lat2, lon: lon2 } = user;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;

    return distance <= maxMiles;
  });
};

export const applyUserPreferences = (matches, preferences) => {
  return matches.filter(match => {
    if (preferences.ageRange && (match.age < preferences.ageRange.min || match.age > preferences.ageRange.max)) {
      return false;
    }
    if (preferences.gender && match.gender !== preferences.gender) {
      return false;
    }
    if (preferences.interests && !preferences.interests.every(interest => match.interests.includes(interest))) {
      return false;
    }
    return true;
  });
};
