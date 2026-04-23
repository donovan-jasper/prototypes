import { getDatabase } from './database';
import { UserProfile, Match, Message, Skill, Preference } from './types';

export const getPotentialCollaborators = async (userId: number): Promise<UserProfile[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Get current user's preferences and skills
      tx.executeSql(
        `SELECT p.preference_value, s.skill_name, s.proficiency
         FROM preferences p
         LEFT JOIN skills s ON p.user_id = s.user_id
         WHERE p.user_id = ?`,
        [userId],
        (_, { rows: { _array: userData } }) => {
          const userPreferences = userData.map(item => item.preference_value);
          const userSkills = userData.filter(item => item.skill_name).map(item => ({
            skill_name: item.skill_name,
            proficiency: item.proficiency
          }));

          // Find users with matching preferences or skills
          tx.executeSql(
            `SELECT DISTINCT u.id, u.username, u.email, u.location, u.created_at
             FROM users u
             LEFT JOIN preferences p ON u.id = p.user_id
             LEFT JOIN skills s ON u.id = s.user_id
             WHERE u.id != ?
             AND (p.preference_value IN (${userPreferences.map(() => '?').join(',')})
                  OR s.skill_name IN (${userSkills.map(() => '?').join(',')}))`,
            [userId, ...userPreferences, ...userSkills.map(skill => skill.skill_name)],
            async (_, { rows: { _array: potentialUsers } }) => {
              try {
                const profiles = await Promise.all(potentialUsers.map(async (user) => {
                  const profile = await getUserProfile(user.id);
                  // Calculate match score based on shared preferences and skills
                  const sharedPreferences = profile.preferences.filter(p =>
                    userPreferences.includes(p.preference_value)
                  ).length;

                  const sharedSkills = profile.skills.filter(s =>
                    userSkills.some(us => us.skill_name === s.skill_name)
                  ).length;

                  // Simple scoring algorithm - can be enhanced
                  const matchScore = (sharedPreferences * 2) + sharedSkills;

                  return {
                    ...profile,
                    matchScore
                  };
                }));

                // Sort by match score (descending)
                profiles.sort((a, b) => b.matchScore - a.matchScore);

                resolve(profiles);
              } catch (error) {
                reject(error);
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

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Get user data
      tx.executeSql(
        `SELECT * FROM users WHERE id = ?`,
        [userId],
        (_, { rows: { _array: userData } }) => {
          if (userData.length === 0) {
            reject(new Error('User not found'));
            return;
          }

          const user = userData[0];

          // Get skills
          tx.executeSql(
            `SELECT * FROM skills WHERE user_id = ?`,
            [userId],
            (_, { rows: { _array: skills } }) => {
              // Get preferences
              tx.executeSql(
                `SELECT * FROM preferences WHERE user_id = ?`,
                [userId],
                (_, { rows: { _array: preferences } }) => {
                  // Calculate Spark Score (simplified for MVP)
                  const sparkScore = calculateSparkScore(skills, preferences);

                  resolve({
                    user,
                    skills,
                    preferences,
                    sparkScore
                  });
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

const calculateSparkScore = (skills: Skill[], preferences: Preference[]): number => {
  // Simple scoring algorithm - can be enhanced
  const skillScore = skills.reduce((sum, skill) => sum + skill.proficiency, 0);
  const preferenceScore = preferences.length * 2; // Preferences count double
  return skillScore + preferenceScore;
};

export const createMatch = async (user1Id: number, user2Id: number, ideaId?: number): Promise<Match> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Calculate match score based on shared preferences and skills
      tx.executeSql(
        `SELECT COUNT(*) as shared_preferences
         FROM preferences p1
         JOIN preferences p2 ON p1.preference_value = p2.preference_value
         WHERE p1.user_id = ? AND p2.user_id = ?`,
        [user1Id, user2Id],
        (_, { rows: { _array: prefResult } }) => {
          const sharedPreferences = prefResult[0].shared_preferences;

          tx.executeSql(
            `SELECT COUNT(*) as shared_skills
             FROM skills s1
             JOIN skills s2 ON s1.skill_name = s2.skill_name
             WHERE s1.user_id = ? AND s2.user_id = ?`,
            [user1Id, user2Id],
            (_, { rows: { _array: skillResult } }) => {
              const sharedSkills = skillResult[0].shared_skills;

              const matchScore = (sharedPreferences * 2) + sharedSkills;

              // Create the match
              tx.executeSql(
                `INSERT INTO matches (user1_id, user2_id, idea_id, match_score, status)
                 VALUES (?, ?, ?, ?, 'pending')`,
                [user1Id, user2Id, ideaId || null, matchScore],
                (_, { insertId }) => {
                  resolve({
                    id: insertId,
                    user1_id: user1Id,
                    user2_id: user2Id,
                    idea_id: ideaId,
                    match_score: matchScore,
                    status: 'pending',
                    created_at: new Date().toISOString()
                  });
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

export const getUserMatches = async (userId: number): Promise<Match[]> => {
  const db = await getDatabase();

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

export const getMessages = async (matchId: number): Promise<Message[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM messages
         WHERE match_id = ?
         ORDER BY created_at ASC`,
        [matchId],
        (_, { rows: { _array: messages } }) => {
          resolve(messages);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const sendMessage = async (matchId: number, senderId: number, content: string): Promise<Message> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO messages (match_id, sender_id, content, read_status)
         VALUES (?, ?, ?, 0)`,
        [matchId, senderId, content],
        (_, { insertId }) => {
          resolve({
            id: insertId,
            match_id: matchId,
            sender_id: senderId,
            content,
            read_status: false,
            created_at: new Date().toISOString()
          });
        },
        (_, error) => reject(error)
      );
    });
  });
};
