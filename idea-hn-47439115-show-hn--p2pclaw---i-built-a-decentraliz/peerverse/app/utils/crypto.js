import sodium from 'libsodium-wrappers';

export const generateProof = async (data) => {
  try {
    await sodium.ready;
    const hash = sodium.crypto_generichash(64, sodium.from_string(data));
    return sodium.to_hex(hash);
  } catch (error) {
    console.error('Proof generation failed:', error);
    throw new Error('Failed to generate proof');
  }
};

export const verifyProof = async (data, proof) => {
  try {
    await sodium.ready;
    const hash = sodium.crypto_generichash(64, sodium.from_string(data));
    return sodium.to_hex(hash) === proof;
  } catch (error) {
    console.error('Proof verification failed:', error);
    throw new Error('Failed to verify proof');
  }
};
