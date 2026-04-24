import sodium from 'libsodium-wrappers';

export const generateProof = async (data) => {
  await sodium.ready;
  const hash = sodium.crypto_generichash(64, sodium.from_string(data));
  return sodium.to_hex(hash);
};

export const verifyProof = async (data, proof) => {
  await sodium.ready;
  const hash = sodium.crypto_generichash(64, sodium.from_string(data));
  return sodium.to_hex(hash) === proof;
};
