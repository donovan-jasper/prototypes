import { computeImageHash, compareHashes } from '../utils/imageHash';

describe('Image Hashing', () => {
  it('should generate consistent hash for same image', async () => {
    const hash1 = await computeImageHash('file:///test.jpg');
    const hash2 = await computeImageHash('file:///test.jpg');
    expect(hash1).toBe(hash2);
  });

  it('should generate 16-character hex hash', async () => {
    const hash = await computeImageHash('file:///test.jpg');
    expect(hash).toHaveLength(16);
    expect(hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it('should detect identical hashes with similarity score of 1.0', () => {
    const hash1 = 'abc123def4567890';
    const hash2 = 'abc123def4567890';
    const similarity = compareHashes(hash1, hash2);
    expect(similarity).toBe(1.0);
  });

  it('should detect similar images with high similarity score', () => {
    const hash1 = 'abc123def4567890';
    const hash2 = 'abc123def4567891'; // 1 bit different in last hex digit
    const similarity = compareHashes(hash1, hash2);
    expect(similarity).toBeGreaterThan(0.9);
  });

  it('should detect very different images with low similarity score', () => {
    const hash1 = 'aaaaaaaaaaaaaaaa';
    const hash2 = '5555555555555555'; // Every bit flipped
    const similarity = compareHashes(hash1, hash2);
    expect(similarity).toBe(0);
  });

  it('should handle invalid hashes gracefully', () => {
    const similarity = compareHashes('', 'abc123');
    expect(similarity).toBe(0);
  });

  it('should calculate correct Hamming distance', () => {
    // 0000 vs 1111 = 4 bits different per hex digit
    const hash1 = '0000000000000000'; // All zeros
    const hash2 = 'ffffffffffffffff'; // All ones
    const similarity = compareHashes(hash1, hash2);
    expect(similarity).toBe(0); // 64 bits different out of 64
  });

  it('should calculate partial similarity correctly', () => {
    // First 8 hex chars same, last 8 different
    const hash1 = 'abc123de00000000';
    const hash2 = 'abc123deffffffff';
    const similarity = compareHashes(hash1, hash2);
    // 32 bits same, 32 bits different = 0.5 similarity
    expect(similarity).toBe(0.5);
  });
});
