import * as Libsodium from 'libsodium-wrappers';

let sodium;

const initializeSodium = async () => {
  if (!sodium) {
    try {
      await Libsodium.ready;
      sodium = Libsodium;
    } catch (error) {
      console.error('Failed to initialize Libsodium:', error);
      throw error;
    }
  }
};

export const generateProof = async (data) => {
  await initializeSodium();

  if (!sodium) {
    throw new Error('Libsodium not ready');
  }

  try {
    const dataBuffer = typeof data === 'string'
      ? sodium.from_string(data)
      : data;

    const hash = sodium.crypto_generichash(
      sodium.crypto_generichash_BYTES,
      dataBuffer
    );

    return sodium.to_hex(hash);
  } catch (error) {
    console.error('Error generating proof:', error);
    throw error;
  }
};

export const verifyProof = async (data, proof) => {
  await initializeSodium();

  if (!sodium) {
    throw new Error('Libsodium not ready');
  }

  try {
    const expectedProof = await generateProof(data);
    return sodium.to_hex(proof) === expectedProof;
  } catch (error) {
    console.error('Error verifying proof:', error);
    throw error;
  }
};

export const generateSubmissionProof = async (paperContent, authorId) => {
  await initializeSodium();

  if (!sodium) {
    throw new Error('Libsodium not ready');
  }

  try {
    const keyPair = sodium.crypto_sign_keypair();
    const combinedData = `${paperContent}|${authorId}|${Date.now()}`;

    const signature = sodium.crypto_sign_detached(
      sodium.from_string(combinedData),
      keyPair.privateKey
    );

    return {
      contentHash: await generateProof(paperContent),
      authorId: authorId,
      timestamp: Date.now(),
      signature: sodium.to_hex(signature),
      publicKey: sodium.to_hex(keyPair.publicKey)
    };
  } catch (error) {
    console.error('Error generating submission proof:', error);
    throw error;
  }
};

export const verifySubmissionProof = async (proof, paperContent) => {
  await initializeSodium();

  if (!sodium) {
    throw new Error('Libsodium not ready');
  }

  try {
    const contentHash = await generateProof(paperContent);
    if (contentHash !== proof.contentHash) {
      return false;
    }

    const combinedData = `${paperContent}|${proof.authorId}|${proof.timestamp}`;
    const signature = sodium.from_hex(proof.signature);
    const publicKey = sodium.from_hex(proof.publicKey);

    return sodium.crypto_sign_verify_detached(
      signature,
      sodium.from_string(combinedData),
      publicKey
    );
  } catch (error) {
    console.error('Error verifying submission proof:', error);
    throw error;
  }
};
