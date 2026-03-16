import { saveDecompilation, getRecentDecompilations } from '../lib/storage/database';

describe('Database Operations', () => {
  it('should save and retrieve decompilation', async () => {
    const data = {
      fileName: 'test.apk',
      fileSize: 1024,
      decompiled: true,
      timestamp: Date.now()
    };
    await saveDecompilation(data);
    const recent = await getRecentDecompilations(1);
    expect(recent[0].fileName).toBe('test.apk');
  });

  it('should retrieve recent decompilations in correct order', async () => {
    const data1 = {
      fileName: 'test1.apk',
      fileSize: 1024,
      decompiled: true,
      timestamp: Date.now() - 1000
    };
    const data2 = {
      fileName: 'test2.apk',
      fileSize: 2048,
      decompiled: true,
      timestamp: Date.now()
    };
    await saveDecompilation(data1);
    await saveDecompilation(data2);
    const recent = await getRecentDecompilations(2);
    expect(recent[0].fileName).toBe('test2.apk');
    expect(recent[1].fileName).toBe('test1.apk');
  });
});
