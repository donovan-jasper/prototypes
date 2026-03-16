import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('behaviormatch.db');

export const getUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM users WHERE id = ?;',
        [userId],
        (_, { rows }) => {
          resolve(rows._array[0]);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const createUser = (userId, preferences) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO users (id, preferences_json) VALUES (?, ?);',
        [userId, JSON.stringify(preferences)],
        (_, { insertId }) => {
          resolve(insertId);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const updateUserPreferences = (userId, preferences) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE users SET preferences_json = ? WHERE id = ?;',
        [JSON.stringify(preferences), userId],
        (_, { rowsAffected }) => {
          resolve(rowsAffected);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const logInteraction = (userId, type, metadata) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO interactions (user_id, type, metadata_json) VALUES (?, ?, ?);',
        [userId, type, JSON.stringify(metadata)],
        (_, { insertId }) => {
          resolve(insertId);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const getUserInteractions = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM interactions WHERE user_id = ? ORDER BY timestamp DESC;',
        [userId],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const saveBehaviorVector = (userId, vectorData) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO behavior_vectors (user_id, vector_data) VALUES (?, ?);',
        [userId, JSON.stringify(vectorData)],
        (_, { insertId }) => {
          resolve(insertId);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const getBehaviorVector = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM behavior_vectors WHERE user_id = ?;',
        [userId],
        (_, { rows }) => {
          resolve(rows._array[0]);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const createMatch = (userId, matchedUserId, compatibilityScore) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO matches (id, user_id, matched_user_id, compatibility_score, status) VALUES (?, ?, ?, ?, ?);',
        [generateMatchId(userId, matchedUserId), userId, matchedUserId, compatibilityScore, 'pending'],
        (_, { insertId }) => {
          resolve(insertId);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const updateMatchStatus = (matchId, status) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE matches SET status = ? WHERE id = ?;',
        [status, matchId],
        (_, { rowsAffected }) => {
          resolve(rowsAffected);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const getUserMatches = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM matches WHERE user_id = ? ORDER BY compatibility_score DESC;',
        [userId],
        (_, { rows }) => {
          resolve(rows._array);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const createConversation = (matchId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO conversations (match_id, messages_json) VALUES (?, ?);',
        [matchId, JSON.stringify([])],
        (_, { insertId }) => {
          resolve(insertId);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const getConversation = (matchId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM conversations WHERE match_id = ?;',
        [matchId],
        (_, { rows }) => {
          resolve(rows._array[0]);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const updateConversation = (matchId, messages) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE conversations SET messages_json = ? WHERE match_id = ?;',
        [JSON.stringify(messages), matchId],
        (_, { rowsAffected }) => {
          resolve(rowsAffected);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

const generateMatchId = (userId, matchedUserId) => {
  // Simple deterministic ID generation for demonstration
  return `${userId}_${matchedUserId}`;
};
