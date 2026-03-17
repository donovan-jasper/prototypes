export const calculateCompatibilityScore = (user1, user2) => {
  const interestScore = calculateInterestScore(user1.interests, user2.interests);
  const ageScore = calculateAgeScore(user1.age, user2.age);
  const distanceScore = calculateDistanceScore(user1.lat, user1.lon, user2.lat, user2.lon);

  const totalScore = (interestScore * 0.4) + (ageScore * 0.3) + (distanceScore * 0.3);
  return Math.round(totalScore);
};

export const calculateInterestScore = (interests1, interests2) => {
  if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) {
    return 0;
  }
  const commonInterests = findCommonInterests(interests1, interests2);
  const totalInterests = new Set([...interests1, ...interests2]).size;
  return (commonInterests.length / totalInterests) * 100;
};

export const calculateAgeScore = (age1, age2) => {
  const ageGap = Math.abs(age1 - age2);
  if (ageGap < 10) return 100;
  if (ageGap < 20) return 80;
  if (ageGap < 30) return 60;
  if (ageGap < 40) return 40;
  return 20;
};

export const calculateDistanceScore = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 3959; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  if (distance < 5) return 100;
  if (distance < 10) return 80;
  if (distance < 15) return 60;
  if (distance < 20) return 40;
  if (distance < 25) return 20;
  return 0;
};

export const findCommonInterests = (interests1, interests2) => {
  if (!interests1 || !interests2) return [];
  return interests1.filter(interest => interests2.includes(interest));
};
