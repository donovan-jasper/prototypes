const CryptoJS = require('crypto-js');

function generateSalt() {
  return CryptoJS.lib.WordArray.random(128/8).toString();
}

function deriveKey(password, salt) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 1000
  });
}

function encryptNote(note, password) {
  const salt = generateSalt();
  const key = deriveKey(password, salt);
  const encrypted = CryptoJS.AES.encrypt(note, key.toString()).toString();
  return { encrypted, salt };
}

function decryptNote(encryptedNote, password, salt) {
  const key = deriveKey(password, salt);
  const decrypted = CryptoJS.AES.decrypt(encryptedNote, key.toString()).toString(CryptoJS.enc.Utf8);
  return decrypted;
}

module.exports = {
  encryptNote,
  decryptNote
};
