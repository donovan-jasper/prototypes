import { getDatabase } from './database';
import { UserProfile, Match, Message } from './types';

export const createMatch = async (user1Id: number, user2Id: number, ideaId?: number): Promise<Match> => {
  const db = await getDatabase();
  const matchScore = await calculateMatchScore(user1Id, user2Id);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO matches (user1_id, user2_id, idea_id, match_score) VALUES (?, ?, ?, ?)',
        [user1Id, user2Id, ideaId || null, matchScore],
        (_, result) => {
          const matchId = result.insertId;
          resolve({
            id: matchId,
            user1_id: user1Id,
            user2_id: user2Id,
            idea_id: ideaId,
            match_score: matchScore,
            status: 'pending',
            created_at: new Date().toISOString()
          });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getUserMatches = async (userId: number): Promise<Match[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM matches WHERE user1_id = ? OR user2_id = ? ORDER BY created_at DESC',
        [userId, userId],
        (_, result) => {
          const matches: Match[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            matches.push(result.rows.item(i));
          }
          resolve(matches);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getPotentialCollaborators = async (userId: number, limit: number = 10): Promise<UserProfile[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First get the current user's skills and preferences
      tx.executeSql(
        `SELECT skill_name, proficiency FROM skills WHERE user_id = ?`,
        [userId],
        (_, skillsResult) => {
          const userSkills: { skill_name: string; proficiency: number }[] = [];
          for (let i = 0; i < skillsResult.rows.length; i++) {
            userSkills.push(skillsResult.rows.item(i));
          }

          tx.executeSql(
            `SELECT preference_type, preference_value FROM preferences WHERE user_id = ?`,
            [userId],
            (_, preferencesResult) => {
              const userPreferences: { preference_type: string; preference_value: string }[] = [];
              for (let i = 0; i < preferencesResult.rows.length; i++) {
                userPreferences.push(preferencesResult.rows.item(i));
              }

              // Find users with complementary skills and preferences
              const query = `
                SELECT DISTINCT u.id, u.username, u.email, u.location, u.created_at
                FROM users u
                LEFT JOIN skills s ON u.id = s.user_id
                LEFT JOIN preferences p ON u.id = p.user_id
                WHERE u.id != ?
                AND (
                  s.skill_name IN (${userSkills.map(() => '?').join(',')}) OR
                  p.preference_value IN (${userPreferences.map(() => '?').join(',')})
                )
                ORDER BY RANDOM()
                LIMIT ?
              `;

              const params = [userId, ...userSkills.map(s => s.skill_name), ...userPreferences.map(p => p.preference_value), limit];

              tx.executeSql(
                query,
                params,
                async (_, result) => {
                  const profiles: UserProfile[] = [];
                  for (let i = 0; i < result.rows.length; i++) {
                    const user = result.rows.item(i);
                    const skills = await getUserSkills(user.id);
                    const preferences = await getUserPreferences(user.id);
                    const sparkScore = await calculateSparkScore(user.id);

                    profiles.push({
                      user,
                      skills,
                      preferences,
                      sparkScore
                    });
                  }
                  resolve(profiles);
                },
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const calculateMatchScore = async (user1Id: number, user2Id: number): Promise<number> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Get user1's skills and preferences
      tx.executeSql(
        `SELECT skill_name, proficiency FROM skills WHERE user_id = ?`,
        [user1Id],
        (_, skills1Result) => {
          const skills1: { skill_name: string; proficiency: number }[] = [];
          for (let i = 0; i < skills1Result.rows.length; i++) {
            skills1.push(skills1Result.rows.item(i));
          }

          tx.executeSql(
            `SELECT preference_type, preference_value FROM preferences WHERE user_id = ?`,
            [user1Id],
            (_, preferences1Result) => {
              const preferences1: { preference_type: string; preference_value: string }[] = [];
              for (let i = 0; i < preferences1Result.rows.length; i++) {
                preferences1.push(preferences1Result.rows.item(i));
              }

              // Get user2's skills and preferences
              tx.executeSql(
                `SELECT skill_name, proficiency FROM skills WHERE user_id = ?`,
                [user2Id],
                (_, skills2Result) => {
                  const skills2: { skill_name: string; proficiency: number }[] = [];
                  for (let i = 0; i < skills2Result.rows.length; i++) {
                    skills2.push(skills2Result.rows.item(i));
                  }

                  tx.executeSql(
                    `SELECT preference_type, preference_value FROM preferences WHERE user_id = ?`,
                    [user2Id],
                    (_, preferences2Result) => {
                      const preferences2: { preference_type: string; preference_value: string }[] = [];
                      for (let i = 0; i < preferences2Result.rows.length; i++) {
                        preferences2.push(preferences2Result.rows.item(i));
                      }

                      // Calculate match score based on complementary skills and preferences
                      let score = 0;

                      // Skill matching (higher proficiency matches better)
                      const skillNames1 = skills1.map(s => s.skill_name);
                      const skillNames2 = skills2.map(s => s.skill_name);

                      const commonSkills = skillNames1.filter(skill => skillNames2.includes(skill));
                      score += commonSkills.length * 20; // 20 points per common skill

                      // Preference matching
                      const preferenceValues1 = preferences1.map(p => p.preference_value);
                      const preferenceValues2 = preferences2.map(p => p.preference_value);

                      const commonPreferences = preferenceValues1.filter(pref => preferenceValues2.includes(pref));
                      score += commonPreferences.length * 10; // 10 points per common preference

                      // Cap the score at 100
                      score = Math.min(score, 100);

                      resolve(score);
                    },
                    (_, error) => {
                      reject(error);
                      return false;
                    }
                  );
                },
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getUserSkills = async (userId: number) => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM skills WHERE user_id = ?',
        [userId],
        (_, result) => {
          const skills = [];
          for (let i = 0; i < result.rows.length; i++) {
            skills.push(result.rows.item(i));
          }
          resolve(skills);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getUserPreferences = async (userId: number) => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM preferences WHERE user_id = ?',
        [userId],
        (_, result) => {
          const preferences = [];
          for (let i = 0; i < result.rows.length; i++) {
            preferences.push(result.rows.item(i));
          }
          resolve(preferences);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const calculateSparkScore = async (userId: number): Promise<number> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Calculate score based on various factors
      let score = 0;

      // Ideas submitted
      tx.executeSql(
        'SELECT COUNT(*) as count FROM ideas WHERE user_id = ?',
        [userId],
        (_, ideasResult) => {
          score += ideasResult.rows.item(0).count * 10;

          // Feedback given
          tx.executeSql(
            'SELECT COUNT(*) as count FROM feedback WHERE user_id = ?',
            [userId],
            (_, feedbackResult) => {
              score += feedbackResult.rows.item(0).count * 5;

              // Upvotes received
              tx.executeSql(
                `SELECT COUNT(*) as count FROM votes v
                 JOIN ideas i ON v.idea_id = i.id
                 WHERE i.user_id = ? AND v.vote_type = 'up'`,
                [userId],
                (_, upvotesResult) => {
                  score += upvotesResult.rows.item(0).count * 2;

                  // Matches created
                  tx.executeSql(
                    'SELECT COUNT(*) as count FROM matches WHERE user1_id = ? OR user2_id = ?',
                    [userId, userId],
                    (_, matchesResult) => {
                      score += matchesResult.rows.item(0).count * 15;

                      // Cap the score at 1000
                      score = Math.min(score, 1000);
                      resolve(score);
                    },
                    (_, error) => {
                      reject(error);
                      return false;
                    }
                  );
                },
                (_, error) => {
                  reject(error);
                  return false;
                }
              );
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const sendMessage = async (matchId: number, senderId: number, content: string): Promise<Message> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO messages (match_id, sender_id, content) VALUES (?, ?, ?)',
        [matchId, senderId, content],
        (_, result) => {
          const messageId = result.insertId;
          resolve({
            id: messageId,
            match_id: matchId,
            sender_id: senderId,
            content,
            read_status: false,
            created_at: new Date().toISOString()
          });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getMessages = async (matchId: number): Promise<Message[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM messages WHERE match_id = ? ORDER BY created_at ASC',
        [matchId],
        (_, result) => {
          const messages: Message[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            messages.push(result.rows.item(i));
          }
          resolve(messages);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
