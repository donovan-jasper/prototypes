import { getDatabase } from './database';
import { User, Skill, Preference, UserProfile } from './types';

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
                  // Calculate Spark Score
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

export const updateUserProfile = async (user: User): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE users SET username = ?, email = ?, location = ? WHERE id = ?`,
        [user.username, user.email, user.location, user.id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const addSkill = async (skill: Skill): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO skills (user_id, skill_name, proficiency) VALUES (?, ?, ?)`,
        [skill.user_id, skill.skill_name, skill.proficiency],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const removeSkill = async (skillId: number): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM skills WHERE id = ?`,
        [skillId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const addPreference = async (preference: Preference): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO preferences (user_id, preference_type, preference_value) VALUES (?, ?, ?)`,
        [preference.user_id, preference.preference_type, preference.preference_value],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const removePreference = async (preferenceId: number): Promise<void> => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM preferences WHERE id = ?`,
        [preferenceId],
        () => resolve(),
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
