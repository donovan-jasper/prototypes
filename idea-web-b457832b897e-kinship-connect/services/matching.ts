import { calculateCompatibilityScore } from '../utils/compatibility';

interface User {
  id: string;
  name: string;
  age: number;
  interests: string[];
  lat: number;
  lon: number;
  distance?: number;
  compatibilityScore?: number;
}

interface Location {
  lat: number;
  lon: number;
}

export const getMatchSuggestions = (currentUser: User, allUsers: User[], limit: number = 10): User[] => {
  // Filter out current user and users without location
  const potentialMatches = allUsers.filter(user =>
    user.id !== currentUser.id && user.lat && user.lon
  );

  // Calculate distance and compatibility for each potential match
  const matchesWithScores = potentialMatches.map(match => {
    const distance = calculateDistance(
      { lat: currentUser.lat, lon: currentUser.lon },
      { lat: match.lat, lon: match.lon }
    );

    const compatibilityScore = calculateCompatibilityScore(currentUser, match);

    return {
      ...match,
      distance,
      compatibilityScore
    };
  });

  // Sort by compatibility score (descending) and then by distance (ascending)
  const sortedMatches = matchesWithScores.sort((a, b) => {
    if (b.compatibilityScore !== a.compatibilityScore) {
      return b.compatibilityScore - a.compatibilityScore;
    }
    return a.distance - b.distance;
  });

  // Return top N matches
  return sortedMatches.slice(0, limit);
};

export const filterByDistance = (users: User[], location: Location, maxMiles: number): User[] => {
  return users.filter(user => {
    const distance = calculateDistance(location, { lat: user.lat, lon: user.lon });
    return distance <= maxMiles;
  });
};

export const calculateDistance = (loc1: Location, loc2: Location): number => {
  // Haversine formula to calculate distance between two points in miles
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lon - loc1.lon);
  const lat1 = toRad(loc1.lat);
  const lat2 = toRad(loc2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};
