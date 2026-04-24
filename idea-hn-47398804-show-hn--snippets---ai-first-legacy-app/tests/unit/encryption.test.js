const { encrypt, decrypt } = require('../../app/services/encryption');

test('Encrypts and decrypts data', () => {
  const secret = 'Test message';
  const key = 'secure-key';
  const encrypted = encrypt(secret, key);
  const decrypted = decrypt(encrypted, key);
  expect(decrypted).toBe(secret);
});
