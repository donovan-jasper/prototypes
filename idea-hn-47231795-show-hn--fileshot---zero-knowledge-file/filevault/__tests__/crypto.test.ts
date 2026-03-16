import { encryptFile, decryptFile, generateKey } from '../lib/crypto';

describe('Encryption', () => {
  it('encrypts and decrypts file data', async () => {
    const key = await generateKey();
    const data = 'sensitive content';
    const encrypted = await encryptFile(data, key);
    const decrypted = await decryptFile(encrypted, key);
    expect(decrypted).toBe(data);
  });

  it('fails decryption with wrong key', async () => {
    const key1 = await generateKey();
    const key2 = await generateKey();
    const encrypted = await encryptFile('data', key1);
    await expect(decryptFile(encrypted, key2)).rejects.toThrow();
  });
});
