import { db, updateMessageSyncedStatus } from './db';
import NetInfo from '@react-native-community/netinfo';
import { Message } from '../types';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_SYNC_TASK = 'background-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  const syncedCount = await syncPendingMessages();
  return syncedCount > 0 ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
});

export async function registerBackgroundSync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background sync registered');
  } catch (err) {
    console.error('Failed to register background sync:', err);
  }
}

export async function queueOfflineMessage(message: Message) {
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

      const response = await fetch('https://api.voxcrew.com/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        await db.runAsync('DELETE FROM pending_messages WHERE id = ?', [item.id]);
        await updateMessageSyncedStatus(message.id, true);
        syncedCount++;
        console.log('Successfully synced message:', message.id);
      } else {
        console.warn(`Failed to sync message ${message.id} to backend (status: ${response.status}). Will retry later.`);
      }
    } catch (err) {
      console.error('Network error during sync for message', item.id, err);
    }
  }

  return syncedCount;
}

export async function checkForConflicts(messageId: string) {
  const localMessage = await db.getFirstAsync(
    'SELECT * FROM messages WHERE id = ?',
    [messageId]
  );

  if (!localMessage) return false;

  try {
    const response = await fetch(`https://api.voxcrew.com/messages/${messageId}`);
    const remoteMessage = await response.json();

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

export async function resolveConflict(messageId: string, resolvedText: string) {
  try {
    // Update local message with resolved text
    await db.runAsync(
      'UPDATE messages SET text = ?, timestamp = ? WHERE id = ?',
      [resolvedText, Date.now(), messageId]
    );

    // Send resolved version to server
    const localMessage = await db.getFirstAsync(
      'SELECT * FROM messages WHERE id = ?',
      [messageId]
    );

    const response = await fetch(`https://api.voxcrew.com/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localMessage),
    });

    if (response.ok) {
      console.log('Conflict resolved and synced to server');
      return true;
    }
  } catch (err) {
    console.error('Error resolving conflict:', err);
  }

  return false;
}
