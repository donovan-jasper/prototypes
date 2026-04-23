export const calculateCompatibilityScore = (user1: any, user2: any): number => {
  // Calculate interest match score (40% weight)
  const commonInterests = findCommonInterests(user1.interests, user2.interests);
  const interestScore = (commonInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 40;

  // Calculate age gap appropriateness (20% weight)
  const ageGap = Math.abs(user1.age - user2.age);
  let ageGapScore = 0;
  if (ageGap < 20) {
    ageGapScore = 20; // Ideal age gap
  } else if (ageGap < 30) {
    ageGapScore = 15;
  } else if (ageGap < 40) {
    ageGapScore = 10;
  } else {
    ageGapScore = 5;
  }

  // Calculate availability overlap (20% weight)
  let availabilityScore = 0;
  if (user1.availability && user2.availability) {
    const commonDays = user1.availability.days.filter(day =>
      user2.availability.days.includes(day)
    );
    const commonTimes = user1.availability.times.filter(time =>
      user2.availability.times.includes(time)
    );
    availabilityScore = ((commonDays.length / 7) + (commonTimes.length / user1.availability.times.length)) * 10;
  }

  // Calculate connection goal alignment (20% weight)
  let goalAlignmentScore = 0;
  if (user1.connectionGoal && user2.connectionGoal) {
    if (user1.connectionGoal === user2.connectionGoal) {
      goalAlignmentScore = 20;
    } else if (
      (user1.connectionGoal === 'mentor' && user2.connectionGoal === 'mentee') ||
      (user1.connectionGoal === 'mentee' && user2.connectionGoal === 'mentor')
    ) {
      goalAlignmentScore = 15;
    } else {
      goalAlignmentScore = 10;
    }
  }

  // Combine scores
  const totalScore = interestScore + ageGapScore + availabilityScore + goalAlignmentScore;

  // Ensure score is between 0 and 100
  return Math.min(Math.max(Math.round(totalScore), 0), 100);
};

export const findCommonInterests = (interests1: string[], interests2: string[]): string[] => {
  if (!interests1 || !interests2) return [];

  const normalizedInterests1 = interests1.map(i => i.toLowerCase());
  const normalizedInterests2 = interests2.map(i => i.toLowerCase());

  return normalizedInterests1.filter(interest =>
    normalizedInterests2.includes(interest)
  );
};
