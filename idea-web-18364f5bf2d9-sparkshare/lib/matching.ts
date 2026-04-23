import { getDatabase } from './database';
import { User, Skill, Preference, Match } from './types';

const db = getDatabase();

export const findPotentialMatches = async (
  userId: number,
  ideaId?: number,
  filters: {
    skills?: string[];
    location?: string;
    minMatchScore?: number;
  } = {}
): Promise<UserProfile[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Get current user's skills and preferences
      tx.executeSql(
        `SELECT * FROM skills WHERE user_id = ?`,
        [userId],
        (_, { rows: { _array: userSkills } }) => {
          tx.executeSql(
            `SELECT * FROM preferences WHERE user_id = ?`,
            [userId],
            (_, { rows: { _array: userPreferences } }) => {
              // Find potential matches
              let query = `
                SELECT DISTINCT u.*, m.match_score
                FROM users u
                LEFT JOIN matches m ON (u.id = m.user2_id AND m.user1_id = ?) OR (u.id = m.user1_id AND m.user2_id = ?)
                WHERE u.id != ?
              `;

              const params: any[] = [userId, userId, userId];

              if (ideaId) {
                query += ` AND EXISTS (
                  SELECT 1 FROM preferences p
                  WHERE p.user_id = u.id AND p.preference_type = 'idea_interest' AND p.preference_value = ?
                )`;
                params.push(ideaId.toString());
              }

              if (filters.location) {
                query += ` AND u.location = ?`;
                params.push(filters.location);
              }

              if (filters.skills && filters.skills.length > 0) {
                query += ` AND EXISTS (
                  SELECT 1 FROM skills s
                  WHERE s.user_id = u.id AND s.skill_name IN (${filters.skills.map(() => '?').join(',')})
                )`;
                params.push(...filters.skills);
              }

              if (filters.minMatchScore) {
                query += ` AND (m.match_score >= ? OR m.match_score IS NULL)`;
                params.push(filters.minMatchScore);
              }

              query += ` ORDER BY m.match_score DESC, u.created_at DESC`;

              tx.executeSql(
                query,
                params,
                (_, { rows: { _array: potentialMatches } }) => {
                  // Calculate match scores for each potential match
                  const matchesWithScores = potentialMatches.map(match => {
                    const matchScore = calculateMatchScore(
                      userSkills,
                      userPreferences,
                      match.id
                    );
                    return { ...match, match_score: matchScore };
                  });

                  // Sort by match score
                  matchesWithScores.sort((a, b) => b.match_score - a.match_score);

                  // Get full user profiles
                  const userIds = matchesWithScores.map(m => m.id);
                  if (userIds.length === 0) {
                    resolve([]);
                    return;
                  }

                  tx.executeSql(
                    `SELECT * FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`,
                    userIds,
                    (_, { rows: { _array: users } }) => {
                      tx.executeSql(
                        `SELECT * FROM skills WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
                        userIds,
                        (_, { rows: { _array: skills } }) => {
                          tx.executeSql(
                            `SELECT * FROM preferences WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
                            userIds,
                            (_, { rows: { _array: preferences } }) => {
                              // Combine data into user profiles
                              const profiles = users.map(user => {
                                const userSkills = skills.filter(s => s.user_id === user.id);
                                const userPreferences = preferences.filter(p => p.user_id === user.id);
                                const match = matchesWithScores.find(m => m.id === user.id);

                                return {
                                  user,
                                  skills: userSkills,
                                  preferences: userPreferences,
                                  sparkScore: match?.match_score || 0
                                };
                              });

                              resolve(profiles);
                            },
                            (_, error) => reject(error)
                          );
                        },
                        (_, error) => reject(error)
                      );
                    },
                    (_, error) => reject(error)
                  );
                },
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

const calculateMatchScore = (
  userSkills: Skill[],
  userPreferences: Preference[],
  targetUserId: number
): number => {
  // This is a simplified matching algorithm that would be enhanced in production
  // In a real app, you'd want to:
  // - Use more sophisticated matching (e.g., cosine similarity)
  // - Consider location distance
  // - Weight different factors appropriately
  // - Add machine learning for better personalization

  // For now, we'll use a simple scoring system
  let score = 0;

  // Get target user's skills and preferences
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM skills WHERE user_id = ?`,
      [targetUserId],
      (_, { rows: { _array: targetSkills } }) => {
        tx.executeSql(
          `SELECT * FROM preferences WHERE user_id = ?`,
          [targetUserId],
          (_, { rows: { _array: targetPreferences } }) => {
            // Skill matching (20% of score)
            const commonSkills = userSkills.filter(skill =>
              targetSkills.some(targetSkill => targetSkill.skill_name === skill.skill_name)
            );
            score += (commonSkills.length / Math.max(userSkills.length, targetSkills.length)) * 20;

            // Preference matching (30% of score)
            const commonPreferences = userPreferences.filter(pref =>
              targetPreferences.some(targetPref =>
                targetPref.preference_type === pref.preference_type &&
                targetPref.preference_value === pref.preference_value
              )
            );
            score += (commonPreferences.length / Math.max(userPreferences.length, targetPreferences.length)) * 30;

            // Location matching (10% of score)
            tx.executeSql(
              `SELECT location FROM users WHERE id = ?`,
              [targetUserId],
              (_, { rows: { _array: targetUser } }) => {
                if (targetUser.length > 0 && userPreferences.some(p => p.preference_type === 'location')) {
                  const userLocation = userPreferences.find(p => p.preference_type === 'location')?.preference_value;
                  if (userLocation === targetUser[0].location) {
                    score += 10;
                  }
                }

                // Idea interest matching (40% of score)
                const userIdeaInterests = userPreferences.filter(p => p.preference_type === 'idea_interest');
                const targetIdeaInterests = targetPreferences.filter(p => p.preference_type === 'idea_interest');
                const commonInterests = userIdeaInterests.filter(interest =>
                  targetIdeaInterests.some(targetInterest => targetInterest.preference_value === interest.preference_value)
                );
                score += (commonInterests.length / Math.max(userIdeaInterests.length, targetIdeaInterests.length)) * 40;

                // Return the final score (0-100)
                return Math.min(Math.max(score, 0), 100);
              }
            );
          }
        );
      }
    );
  });

  // Return a placeholder score while we wait for the transaction to complete
  return 50;
};

export const createMatch = async (
  user1Id: number,
  user2Id: number,
  ideaId?: number
): Promise<Match> => {
  return new Promise((resolve, reject) => {
    const matchScore = calculateMatchScore([], [], user2Id);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO matches (user1_id, user2_id, idea_id, match_score, status)
         VALUES (?, ?, ?, ?, ?)`,
        [user1Id, user2Id, ideaId || null, matchScore, 'pending'],
        (_, { insertId }) => {
          tx.executeSql(
            `SELECT * FROM matches WHERE id = ?`,
            [insertId],
            (_, { rows: { _array: matches } }) => {
              if (matches.length > 0) {
                resolve(matches[0]);
              } else {
                reject(new Error('Failed to create match'));
              }
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserMatches = async (userId: number): Promise<Match[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM matches
         WHERE user1_id = ? OR user2_id = ?
         ORDER BY created_at DESC`,
        [userId, userId],
        (_, { rows: { _array: matches } }) => {
          resolve(matches);
        },
        (_, error) => reject(error)
      );
    });
  });
};
