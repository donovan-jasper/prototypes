import * as Libsodium from 'libsodium-wrappers';

let sodium;

(async () => {
  await Libsodium.ready;
  sodium = Libsodium;
})();

export const generateProof = (data) => {
  if (!sodium) {
    throw new Error('Libsodium not ready');
  }

  // Create a hash of the data
  const hash = sodium.crypto_generichash(
    sodium.crypto_generichash_BYTES,
    sodium.to_string(data)
  );

  // Convert to hex string
  return sodium.to_hex(hash);
};

export const verifyProof = (data, proof) => {
  if (!sodium) {
    throw new Error('Libsodium not ready');
  }

  // Generate the expected proof
  const expectedProof = generateProof(data);

  // Compare with the provided proof
  return sodium.to_string(proof) === sodium.to_string(expectedProof);
};
