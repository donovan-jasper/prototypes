import { generateKeyPair, encryptMessage, decryptMessage } from '../lib/encryption';

describe('Encryption', () => {
  test('generates valid key pair', () => {
    const keys = generateKeyPair();

    expect(keys).toHaveProperty('publicKey');
    expect(keys).toHaveProperty('privateKey');
    expect(keys.publicKey.length).toBe(64); // 32 bytes = 64 hex chars
    expect(keys.privateKey.length).toBe(64);
  });

  test('encrypts and decrypts message', async () => {
    const message = 'Sensitive expense data';
    const key = 'test-key-must-be-32-chars-long!';

    const encrypted = await encryptMessage(message, key);
    const decrypted = await decryptMessage(encrypted, key);

    expect(decrypted).toBe(message);
    expect(encrypted).not.toBe(message);
  });

  test('different encryptions produce different ciphertexts', async () => {
    const message = 'Same message';
    const key = 'test-key-must-be-32-chars-long!';

    const encrypted1 = await encryptMessage(message, key);
    const encrypted2 = await encryptMessage(message, key);

    expect(encrypted1).not.toBe(encrypted2); // Different IVs and salts
  });

  test('wrong key fails to decrypt', async () => {
    const message = 'Secret data';
    const key1 = 'correct-key-32-chars-long-here!';
    const key2 = 'wrong-key-32-chars-long-here!!!';

    const encrypted = await encryptMessage(message, key1);

    await expect(decryptMessage(encrypted, key2)).rejects.toThrow();
  });
});
