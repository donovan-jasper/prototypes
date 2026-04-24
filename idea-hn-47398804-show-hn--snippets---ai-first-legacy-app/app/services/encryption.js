import CryptoJS from 'crypto-js';

const encrypt = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decrypt = (encryptedData, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export { encrypt, decrypt };
