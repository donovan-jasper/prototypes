import { findDuplicates } from '../services/duplicateDetector';
import { computeImageHash } from '../utils/imageHash';

describe('Duplicate Detection', () => {
  it('should identify identical images from different clouds', async () => {
    const hash1 = await computeImageHash('file:///path/photo1.jpg');
    const hash2 = await computeImageHash('file:///path/photo1_copy.jpg');

    const duplicates = findDuplicates([
      { id: '1', hash: hash1, source: 'dropbox' },
      { id: '2', hash: hash2, source: 'google' }
    ]);

    expect(duplicates.length).toBe(1);
    expect(duplicates[0].matches).toHaveLength(2);
  });
});
