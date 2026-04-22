import { db } from './db';
import NetInfo from '@react-native-community/netinfo';

export async function queueOfflineMessage(message: any) {
  const id = Date.now().toString();
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
      await fetch('https://api.voxcrew.com/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      
      await db.runAsync('DELETE FROM pending_messages WHERE id = ?', [item.id]);
      synced++;
    } catch (err) {
      console.error('Failed to sync message', err);
    }
  }
  
  return synced;
}
