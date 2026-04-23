import { db, updateMessageSyncedStatus } from './db';
import NetInfo from '@react-native-community/netinfo';
import { Message } from '../types';

export async function queueOfflineMessage(message: Message) {
  // Ensure the message object stored in pending_messages has the correct synced status
  const messageToQueue = { ...message, synced: false };
  await db.runAsync(
    'INSERT INTO pending_messages (id, data, created_at) VALUES (?, ?, ?)',
    [messageToQueue.id, JSON.stringify(messageToQueue), Date.now()]
  );
}

export async function syncPendingMessages(): Promise<number> {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return 0;

  const pending = await db.getAllAsync('SELECT * FROM pending_messages ORDER BY created_at ASC');

  let syncedCount = 0;
  for (const item of pending) {
    try {
      const message: Message = JSON.parse(item.data);
      console.log('Attempting to sync message:', message.id);

      // Simulate sending to backend API
      const response = await fetch('https://api.voxcrew.com/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        // If successful, delete from pending and update local message status
        await db.runAsync('DELETE FROM pending_messages WHERE id = ?', [item.id]);
        await updateMessageSyncedStatus(message.id, true); // Update DB
        syncedCount++;
        console.log('Successfully synced message:', message.id);
      } else {
        console.warn(`Failed to sync message ${message.id} to backend (status: ${response.status}). Will retry later.`);
        // Do not delete from pending_messages if API call failed, so it can be retried
      }
    } catch (err) {
      console.error('Network error during sync for message', item.id, err);
      // Do not delete from pending_messages if network error, so it can be retried
    }
  }

  return syncedCount;
}

export async function checkForConflicts(messageId: string) {
  // Check if the message exists in both local and remote
  const localMessage = await db.getFirstAsync(
    'SELECT * FROM messages WHERE id = ?',
    [messageId]
  );

  if (!localMessage) return false;

  try {
    // Simulate API call to check remote version
    const response = await fetch(`https://api.voxcrew.com/messages/${messageId}`);
    const remoteMessage = await response.json();

    // Simple conflict detection - compare timestamps
    if (remoteMessage.timestamp > localMessage.timestamp) {
      // Remote version is newer - update local
      await db.runAsync(
        'UPDATE messages SET text = ?, timestamp = ? WHERE id = ?',
        [remoteMessage.text, remoteMessage.timestamp, messageId]
      );
      return true;
    }
  } catch (err) {
    console.error('Error checking for conflicts:', err);
  }

  return false;
}
