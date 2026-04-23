import { getDatabase } from './database';
import { UserProfile, Match, Message, Skill, Preference } from './types';

export const getPotentialMatches = async (userId: number): Promise<UserProfile[]> => {
  const db = await getDatabase();

  // Get current user's skills and preferences
  const userSkills = await getUserSkills(userId);
  const userPreferences = await getUserPreferences(userId);

  // Get all users except current user
  const users = await getAllUsersExcept(userId);

  // Calculate match scores for each user
  const potentialMatches: UserProfile[] = [];

  for (const user of users) {
    const matchScore = await calculateMatchScore(user.id, userSkills, userPreferences);
    if (matchScore > 0.3) { // Only show matches with score > 30%
      const profile = await getUserProfile(user.id);
      profile.matchScore = matchScore;
      potentialMatches.push(profile);
    }
  }

  // Sort by match score (descending)
  potentialMatches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return potentialMatches;
};

export const calculateMatchScore = async (
  targetUserId: number,
  currentUserSkills: Skill[],
  currentUserPreferences: Preference[]
): Promise<number> => {
  const targetUserSkills = await getUserSkills(targetUserId);
  const targetUserPreferences = await getUserPreferences(targetUserId);

  // Calculate skill similarity (0-1)
  const skillScore = calculateSkillSimilarity(currentUserSkills, targetUserSkills);

  // Calculate preference similarity (0-1)
  const preferenceScore = calculatePreferenceSimilarity(currentUserPreferences, targetUserPreferences);

  // Weighted average (skills 60%, preferences 40%)
  return (skillScore * 0.6) + (preferenceScore * 0.4);
};

const calculateSkillSimilarity = (skills1: Skill[], skills2: Skill[]): number => {
  if (skills1.length === 0 || skills2.length === 0) return 0;

  // Create a map of skill names to proficiency for quick lookup
  const skillMap1 = new Map(skills1.map(skill => [skill.skill_name.toLowerCase(), skill.proficiency]));
  const skillMap2 = new Map(skills2.map(skill => [skill.skill_name.toLowerCase(), skill.proficiency]));

  // Find common skills
  const commonSkills = skills1.filter(skill => skillMap2.has(skill.skill_name.toLowerCase()));

  if (commonSkills.length === 0) return 0;

  // Calculate similarity score based on proficiency match
  let similarityScore = 0;
  for (const skill of commonSkills) {
    const proficiency1 = skill.proficiency;
    const proficiency2 = skillMap2.get(skill.skill_name.toLowerCase()) || 0;
    similarityScore += 1 - Math.abs(proficiency1 - proficiency2) / 4; // Normalize to 0-1
  }

  // Normalize by the number of common skills
  return similarityScore / commonSkills.length;
};

const calculatePreferenceSimilarity = (prefs1: Preference[], prefs2: Preference[]): number => {
  if (prefs1.length === 0 || prefs2.length === 0) return 0;

  // Group preferences by type
  const prefsMap1 = groupPreferencesByType(prefs1);
  const prefsMap2 = groupPreferencesByType(prefs2);

  let similarityScore = 0;
  let totalTypes = 0;

  // Compare preferences of the same type
  for (const [type, values1] of prefsMap1) {
    if (prefsMap2.has(type)) {
      const values2 = prefsMap2.get(type)!;
      const typeScore = calculateSetSimilarity(values1, values2);
      similarityScore += typeScore;
      totalTypes++;
    }
  }

  return totalTypes > 0 ? similarityScore / totalTypes : 0;
};

const groupPreferencesByType = (preferences: Preference[]): Map<string, Set<string>> => {
  const map = new Map<string, Set<string>>();
  for (const pref of preferences) {
    if (!map.has(pref.preference_type)) {
      map.set(pref.preference_type, new Set());
    }
    map.get(pref.preference_type)!.add(pref.preference_value.toLowerCase());
  }
  return map;
};

const calculateSetSimilarity = (set1: Set<string>, set2: Set<string>): number => {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

export const createMatch = async (user1Id: number, user2Id: number): Promise<Match> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO matches (user1_id, user2_id, match_score, status) VALUES (?, ?, ?, ?)',
        [user1Id, user2Id, 0.5, 'pending'], // Default score and status
        (_, result) => {
          const matchId = result.insertId;
          tx.executeSql(
            'SELECT * FROM matches WHERE id = ?',
            [matchId],
            (_, { rows }) => {
              resolve(rows.item(0) as Match);
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
        'SELECT * FROM matches WHERE user1_id = ? OR user2_id = ? ORDER BY created_at DESC',
        [userId, userId],
        (_, { rows }) => {
          const matches: Match[] = [];
          for (let i = 0; i < rows.length; i++) {
            matches.push(rows.item(i) as Match);
          }
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
        'SELECT * FROM messages WHERE match_id = ? ORDER BY created_at DESC',
        [matchId],
        (_, { rows }) => {
          const messages: Message[] = [];
          for (let i = 0; i < rows.length; i++) {
            messages.push(rows.item(i) as Message);
          }
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
        'INSERT INTO messages (match_id, sender_id, content, read_status) VALUES (?, ?, ?, ?)',
        [matchId, senderId, content, 0],
        (_, result) => {
          const messageId = result.insertId;
          tx.executeSql(
            'SELECT * FROM messages WHERE id = ?',
            [messageId],
            (_, { rows }) => {
              resolve(rows.item(0) as Message);
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getMatchDetails = async (matchId: number): Promise<Match> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM matches WHERE id = ?',
        [matchId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0) as Match);
          } else {
            reject(new Error('Match not found'));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserSkills = async (userId: number): Promise<Skill[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM skills WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          const skills: Skill[] = [];
          for (let i = 0; i < rows.length; i++) {
            skills.push(rows.item(0) as Skill);
          }
          resolve(skills);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserPreferences = async (userId: number): Promise<Preference[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM preferences WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          const preferences: Preference[] = [];
          for (let i = 0; i < rows.length; i++) {
            preferences.push(rows.item(0) as Preference);
          }
          resolve(preferences);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllUsersExcept = async (userId: number): Promise<User[]> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE id != ?',
        [userId],
        (_, { rows }) => {
          const users: User[] = [];
          for (let i = 0; i < rows.length; i++) {
            users.push(rows.item(0) as User);
          }
          resolve(users);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const [user, skills, preferences] = await Promise.all([
    getUserById(userId),
    getUserSkills(userId),
    getUserPreferences(userId)
  ]);

  return {
    user,
    skills,
    preferences,
    sparkScore: calculateSparkScore(skills, preferences)
  };
};

const calculateSparkScore = (skills: Skill[], preferences: Preference[]): number => {
  // Simple score calculation based on number of skills and preferences
  const skillScore = Math.min(skills.length * 5, 50); // Max 50 points for skills
  const preferenceScore = Math.min(preferences.length * 3, 30); // Max 30 points for preferences

  return skillScore + preferenceScore;
};

const getUserById = async (userId: number): Promise<User> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0) as User);
          } else {
            reject(new Error('User not found'));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};
