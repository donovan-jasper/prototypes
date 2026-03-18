import * as Crypto from 'expo-crypto';

export const generateKeyPair = () => {
  // Generate 32-byte hex strings suitable for PBKDF2 derivation
  const publicKey = Array.from(Crypto.getRandomBytes(32))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const privateKey = Array.from(Crypto.getRandomBytes(32))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return { publicKey, privateKey };
};

const deriveKey = async (keyString: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keyString),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encryptMessage = async (message: string, keyString: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Generate random IV (12 bytes for GCM)
  const iv = Crypto.getRandomBytes(12);
  
  // Generate salt for PBKDF2
  const salt = Crypto.getRandomBytes(16);

  // Derive AES-GCM key from input key string
  const key = await deriveKey(keyString, salt);

  // Encrypt the message
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  // Combine salt + IV + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Return base64-encoded result
  return btoa(String.fromCharCode(...combined));
};

export const decryptMessage = async (encryptedBase64: string, keyString: string): Promise<string> => {
  // Decode base64
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // Extract salt, IV, and ciphertext
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  // Derive the same key
  const key = await deriveKey(keyString, salt);

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext
  );

  // Convert back to string
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};
