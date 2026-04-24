import sodium from 'libsodium-wrappers';

export const generateProof = (data) => {
  // Ensure libsodium is ready
  if (!sodium.isReady) {
    throw new Error('Libsodium is not ready');
  }

  // Convert data to Uint8Array
  const dataBuffer = new TextEncoder().encode(data);

  // Generate a random key pair
  const keyPair = sodium.crypto_sign_keypair();

  // Sign the data
  const signature = sodium.crypto_sign_detached(dataBuffer, keyPair.privateKey);

  // Convert signature to hex string
  const proof = sodium.to_hex(signature);

  return proof;
};

export const verifyProof = (data, proof) => {
  // Ensure libsodium is ready
  if (!sodium.isReady) {
    throw new Error('Libsodium is not ready');
  }

  // Convert data to Uint8Array
  const dataBuffer = new TextEncoder().encode(data);

  // Convert proof from hex string to Uint8Array
  const signature = sodium.from_hex(proof);

  // In a real implementation, you would have the public key stored somewhere
  // For this example, we'll use a placeholder public key
  const publicKey = sodium.crypto_sign_seed_keypair(sodium.randombytes_buf(32)).publicKey;

  // Verify the signature
  return sodium.crypto_sign_verify_detached(signature, dataBuffer, publicKey);
};
