export const calculateCompatibilityScore = (user1, user2) => {
  const interestScore = calculateInterestScore(user1.interests, user2.interests);
  const ageScore = calculateAgeScore(user1.age, user2.age);
  const availabilityScore = calculateAvailabilityScore(user1.availability, user2.availability);
  const goalsScore = calculateGoalsScore(user1.goals, user2.goals);

  const totalScore = (interestScore * 0.4) + (ageScore * 0.2) + (availabilityScore * 0.2) + (goalsScore * 0.2);
  return Math.round(totalScore);
};

export const calculateInterestScore = (interests1, interests2) => {
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

export const calculateAvailabilityScore = (availability1, availability2) => {
  if (!availability1 || !availability2) return 50;

  const overlap = availability1.filter(day => availability2.includes(day)).length;
  return (overlap / 7) * 100;
};

export const calculateGoalsScore = (goals1, goals2) => {
  if (!goals1 || !goals2) return 50;

  const commonGoals = goals1.filter(goal => goals2.includes(goal)).length;
  const totalGoals = new Set([...goals1, ...goals2]).size;
  return (commonGoals / totalGoals) * 100;
};

export const findCommonInterests = (interests1, interests2) => {
  return interests1.filter(interest => interests2.includes(interest));
};
