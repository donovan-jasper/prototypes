import { User, Match } from './types';
import { getUsers, getUserById, insertMatch, getMatchByUsers } from './database';

export function calculateMatchScore(user1: User, user2: User): number {
  let score = 0;
  
  // Calculate shared interests (0-70 points)
  const sharedInterests = user1.interests.filter(interest => 
    user2.interests.includes(interest)
  );
  const interestScore = Math.min((sharedInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 70, 70);
  score += interestScore;
  
  // Calculate age gap penalty (0-30 points deduction)
  const ageDifference = Math.abs(user1.age - user2.age);
  const ageGapPreference = user1.ageGapPreference || 20;
  
  if (ageDifference > ageGapPreference) {
    const penalty = Math.min(((ageDifference - ageGapPreference) / ageGapPreference) * 30, 30);
    score -= penalty;
  } else {
    // Bonus for being within preferred age gap
    score += 30;
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

export async function getSuggestedMatches(userId: string): Promise<Array<User & { matchScore: number }>> {
  const currentUser = await getUserById(userId);
  if (!currentUser) throw new Error('User not found');
  
  const allUsers = await getUsers();
  
  // Filter out current user and calculate scores
  const scoredUsers = allUsers
    .filter(user => user.id !== userId)
    .map(user => ({
      ...user,
      matchScore: calculateMatchScore(currentUser, user)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
  
  return scoredUsers;
}

export async function createMatch(userId1: string, userId2: string): Promise<string> {
  const user1 = await getUserById(userId1);
  const user2 = await getUserById(userId2);
  
  if (!user1 || !user2) throw new Error('Users not found');
  
  // Check if match already exists
  const existingMatch = await getMatchByUsers(userId1, userId2);
  if (existingMatch) {
    return existingMatch.id;
  }
  
  const score = calculateMatchScore(user1, user2);
  return await insertMatch(userId1, userId2, score, userId1);
}
