import { db } from './db';
import NetInfo from '@react-native-community/netinfo';
import { updateMessageSyncedStatus } from './db';

export async function queueOfflineMessage(message: any) {
  const id = message.id || Date.now().toString();
  await db.runAsync(
    'INSERT INTO pending_messages (id, data, created_at) VALUES (?, ?, ?)',
    [id, JSON.stringify(message), Date.now()]
  );
}

export async function syncPendingMessages() {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) return 0;

  const pending = await db.getAllAsync('SELECT * FROM pending_messages ORDER BY created_at ASC');

  let synced = 0;
  for (const item of pending) {
    try {
      const message = JSON.parse(item.data);
      console.log('Attempting to sync message:', message.id);

      // Simulate API call with timeout to simulate network
      await new Promise(resolve => setTimeout(resolve, 500));

      // If successful, delete from pending and update local message status
      await db.runAsync('DELETE FROM pending_messages WHERE id = ?', [item.id]);
      await updateMessageSyncedStatus(message.id, true);
      synced++;
      console.log('Successfully synced message:', message.id);
    } catch (err) {
      console.error('Failed to sync message', item.id, err);
      // Optionally, implement retry logic here
    }
  }

  return synced;
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
