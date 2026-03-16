import { computeImageHash, compareHashes } from '../utils/imageHash';

describe('Image Hashing', () => {
  it('should generate consistent hash for same image', async () => {
    const hash1 = await computeImageHash('file:///test.jpg');
    const hash2 = await computeImageHash('file:///test.jpg');
    expect(hash1).toBe(hash2);
  });

  it('should detect similar images with high similarity score', () => {
    const hash1 = 'abc123def456';
    const hash2 = 'abc123def457'; // 1 char different
    const similarity = compareHashes(hash1, hash2);
    expect(similarity).toBeGreaterThan(0.9);
  });
});
