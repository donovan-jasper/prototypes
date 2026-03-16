import { encryptCredentials, decryptCredentials } from '@/lib/utils/encryption';

describe('Credential Encryption', () => {
  test('encrypts and decrypts connection strings', () => {
    const original = 'postgresql://user:pass@localhost:5432/db';
    const encrypted = encryptCredentials(original);
    expect(encrypted).not.toBe(original);

    const decrypted = decryptCredentials(encrypted);
    expect(decrypted).toBe(original);
  });
});
