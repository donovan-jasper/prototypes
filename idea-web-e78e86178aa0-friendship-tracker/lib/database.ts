// ... (previous database.ts content remains the same until the logInteraction function)

export async function logInteraction(
  friendId: number,
  type: Interaction['type'],
  date: string,
  notes?: string,
  photoUri?: string
): Promise<number> {
  if (!db) throw new Error('Database not initialized');

  // Get current streak information
  const currentStreak = await db.getFirstAsync<Streak>(
    'SELECT * FROM streaks WHERE friendId = ?',
    [friendId]
  );

  if (!currentStreak) {
    throw new Error('No streak record found for this friend');
  }

  // Calculate new streak state
  const { updatedStreakDays, freezeUsed } = calculateStreak(
    currentStreak.lastInteraction,
    currentStreak.currentDays,
    {
      used: currentStreak.freezeUsed === 1,
      available: true // Assuming freeze is always available unless used
    }
  );

  // Insert the interaction
  const result = await db.runAsync(
    'INSERT INTO interactions (friendId, type, date, notes, photoUri) VALUES (?, ?, ?, ?, ?)',
    [friendId, type, date, notes || null, photoUri || null]
  );

  // Update friend's last contact date and connection score
  const newScore = calculateConnectionScore(date);

  await db.runAsync(
    'UPDATE friends SET lastContact = ?, connectionScore = ? WHERE id = ?',
    [date, newScore, friendId]
  );

  // Update streak information
  const longestDays = Math.max(currentStreak.longestDays, updatedStreakDays);

  await db.runAsync(
    `UPDATE streaks SET
      currentDays = ?,
      longestDays = ?,
      lastInteraction = ?,
      freezeUsed = ?
    WHERE friendId = ?`,
    [
      updatedStreakDays,
      longestDays,
      date,
      freezeUsed ? 1 : 0,
      friendId
    ]
  );

  return result.lastInsertRowId;
}

export async function getAllInteractions(): Promise<Interaction[]> {
  if (!db) throw new Error('Database not initialized');

  const interactions = await db.getAllAsync<Interaction>(
    'SELECT * FROM interactions ORDER BY date DESC'
  );

  return interactions;
}

export async function getInteractionsByFriendId(friendId: number): Promise<Interaction[]> {
  if (!db) throw new Error('Database not initialized');

  const interactions = await db.getAllAsync<Interaction>(
    'SELECT * FROM interactions WHERE friendId = ? ORDER BY date DESC',
    [friendId]
  );

  return interactions;
}

// ... (rest of the file remains unchanged)
