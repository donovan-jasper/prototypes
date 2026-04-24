const { generateSubmissionProof, verifySubmissionProof } = require('../app/utils/crypto');

test('Proof generation and verification', async () => {
  const data = "Sample research paper";
  const authors = ["Author 1", "Author 2"];
  const proof = await generateSubmissionProof(data, authors);
  expect(await verifySubmissionProof(data, proof)).toBe(true);
});
