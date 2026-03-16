import { FileManager } from '@/services/storage/fileManager';

describe('FileManager', () => {
  it('should categorize files by type', async () => {
    const manager = new FileManager();
    const files = [
      { uri: 'file:///photo.jpg', type: 'image' },
      { uri: 'file:///receipt.pdf', type: 'document' },
    ];

    const categorized = await manager.categorize(files);
    expect(categorized.photos).toHaveLength(1);
    expect(categorized.documents).toHaveLength(1);
  });

  it('should detect duplicate files', async () => {
    const manager = new FileManager();
    const files = [
      { uri: 'file:///photo1.jpg', hash: 'abc123' },
      { uri: 'file:///photo2.jpg', hash: 'abc123' },
    ];

    const duplicates = await manager.findDuplicates(files);
    expect(duplicates).toHaveLength(1);
  });
});
