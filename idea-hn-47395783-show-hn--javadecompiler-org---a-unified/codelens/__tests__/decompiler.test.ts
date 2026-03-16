import { decompileJavaClass, extractAPK } from '../lib/decompiler';

describe('Java Decompiler', () => {
  it('should decompile a simple Java class', async () => {
    const bytecode = Buffer.from('mock-bytecode');
    const result = await decompileJavaClass(bytecode);
    expect(result).toContain('public class');
  });

  it('should handle invalid bytecode gracefully', async () => {
    const invalid = Buffer.from('not-bytecode');
    await expect(decompileJavaClass(invalid)).rejects.toThrow();
  });
});

describe('Android APK Decompiler', () => {
  it('should extract files from APK', async () => {
    const apkFile = Buffer.from('mock-apk');
    const result = await extractAPK(apkFile);
    expect(result).toHaveLength(5); // Assuming 5 files in mock APK
  });

  it('should handle corrupted APK files', async () => {
    const corrupted = Buffer.from('corrupted-apk');
    await expect(extractAPK(corrupted)).rejects.toThrow();
  });
});
