interface User {
  id?: string;
  name?: string;
  age: number;
  interests: string[];
  availability?: {
    days: string[];
    times: string[];
  };
  connectionGoal?: string;
  skills?: string[];
  learningInterests?: string[];
}

export const calculateCompatibilityScore = (user1: User, user2: User): number => {
  // Calculate each component score (0-100)
  const interestScore = calculateInterestScore(user1.interests, user2.interests);
  const ageGapScore = calculateAgeGapScore(user1.age, user2.age);
  const availabilityScore = calculateAvailabilityScore(user1.availability, user2.availability);
  const goalAlignmentScore = calculateGoalAlignmentScore(user1.connectionGoal, user2.connectionGoal);
  const skillExchangeScore = calculateSkillExchangeScore(user1, user2);

  // Weighted average (30% interests, 20% age gap, 20% availability, 20% goals, 10% skill exchange)
  const totalScore = (interestScore * 0.3) +
                    (ageGapScore * 0.2) +
                    (availabilityScore * 0.2) +
                    (goalAlignmentScore * 0.2) +
                    (skillExchangeScore * 0.1);

  // Round to nearest integer
  return Math.round(totalScore);
};

export const calculateInterestScore = (interests1: string[], interests2: string[]): number => {
  if (!interests1?.length || !interests2?.length) return 0;

  const commonInterests = findCommonInterests(interests1, interests2);
  const totalInterests = new Set([...interests1, ...interests2]).size;

  // Score is percentage of total unique interests that are common
  return (commonInterests.length / totalInterests) * 100;
};

export const findCommonInterests = (interests1: string[], interests2: string[]): string[] => {
  if (!interests1 || !interests2) return [];

  const set1 = new Set(interests1.map(i => i.toLowerCase()));
  const set2 = new Set(interests2.map(i => i.toLowerCase()));

  const common = [...set1].filter(interest => set2.has(interest));
  return common;
};

export const calculateAgeGapScore = (age1: number, age2: number): number => {
  const ageGap = Math.abs(age1 - age2);

  // Ideal age gaps for different scenarios
  if (ageGap <= 10) return 100; // Close age match
  if (ageGap <= 20) return 80;   // Good match
  if (ageGap <= 30) return 60;   // Acceptable
  if (ageGap <= 40) return 40;   // Possible
  return 20;                    // Unlikely to connect
};

export const calculateAvailabilityScore = (
  availability1: { days: string[]; times: string[] } | undefined,
  availability2: { days: string[]; times: string[] } | undefined
): number => {
  if (!availability1 || !availability2) return 0;

  // Calculate day overlap percentage
  const commonDays = availability1.days.filter(day => availability2.days.includes(day));
  const dayOverlap = (commonDays.length / 7) * 100;

  // Calculate time overlap percentage (simplified)
  const timeOverlap = availability1.times.some(time =>
    availability2.times.includes(time)
  ) ? 100 : 0;

  // Combined score (equal weight to days and times)
  return (dayOverlap + timeOverlap) / 2;
};

export const calculateGoalAlignmentScore = (goal1: string | undefined, goal2: string | undefined): number => {
  if (!goal1 || !goal2) return 0;

  // Check if goals are complementary
  const complementaryPairs = [
    ['mentor', 'mentee'],
    ['mentee', 'mentor'],
    ['friend', 'friend'],
    ['skill-share', 'skill-share'],
    ['support', 'support']
  ];

  const pair = [goal1.toLowerCase(), goal2.toLowerCase()].sort();
  const isComplementary = complementaryPairs.some(p =>
    p[0] === pair[0] && p[1] === pair[1]
  );

  return isComplementary ? 100 : 0;
};

export const calculateSkillExchangeScore = (user1: User, user2: User): number => {
  if (!user1.skills?.length || !user2.learningInterests?.length) {
    return 0;
  }

  // Check if user1's skills match user2's learning interests
  const matchingSkills = user1.skills.filter(skill =>
    user2.learningInterests?.some(interest =>
      interest.toLowerCase().includes(skill.toLowerCase())
    )
  );

  // Check if user2's skills match user1's learning interests
  const reverseMatchingSkills = user2.skills?.filter(skill =>
    user1.learningInterests?.some(interest =>
      interest.toLowerCase().includes(skill.toLowerCase())
    )
  ) || [];

  const totalMatching = matchingSkills.length + reverseMatchingSkills.length;
  const totalPossible = Math.max(user1.skills.length, user2.learningInterests?.length || 0) +
                        Math.max(user2.skills?.length || 0, user1.learningInterests?.length || 0);

  if (totalPossible === 0) return 0;

  return (totalMatching / totalPossible) * 100;
};
