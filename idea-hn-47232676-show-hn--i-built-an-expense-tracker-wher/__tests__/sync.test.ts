import { encryptMessage, decryptMessage } from '../lib/encryption';
import { createSyncPayload, applySyncPayload } from '../lib/sync';

describe('Peer Sync', () => {
  test('encrypts and decrypts sync payload', async () => {
    const key = 'test-encryption-key-32-characters';
    const payload = { expenses: [{ id: 1, amount: 50 }] };

    const encrypted = await encryptMessage(JSON.stringify(payload), key);
    const decrypted = await decryptMessage(encrypted, key);

    expect(JSON.parse(decrypted)).toEqual(payload);
  });

  test('creates valid sync payload', async () => {
    const payload = await createSyncPayload();

    expect(payload).toHaveProperty('expenses');
    expect(payload).toHaveProperty('timestamp');
    expect(Array.isArray(payload.expenses)).toBe(true);
  });
});
