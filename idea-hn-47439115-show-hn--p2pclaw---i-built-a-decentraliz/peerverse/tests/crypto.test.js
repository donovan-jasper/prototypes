import { generateProof, verifyProof } from '../app/utils/crypto';

test('Proof generation and verification', async () => {
  const data = "Sample research paper";
  const proof = await generateProof(data);
  expect(await verifyProof(data, proof)).toBe(true);
});
