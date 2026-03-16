import { generateKeyPair, encryptMessage, decryptMessage } from '../lib/encryption';

describe('Encryption', () => {
  test('generates valid key pair', () => {
    const keys = generateKeyPair();

    expect(keys).toHaveProperty('publicKey');
    expect(keys).toHaveProperty('privateKey');
    expect(keys.publicKey.length).toBeGreaterThan(0);
  });

  test('encrypts and decrypts message', () => {
    const message = 'Sensitive expense data';
    const key = 'test-key-must-be-32-chars-long!';

    const encrypted = encryptMessage(message, key);
    const decrypted = decryptMessage(encrypted, key);

    expect(decrypted).toBe(message);
    expect(encrypted).not.toBe(message);
  });
});
