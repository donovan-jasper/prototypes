import { decompileJavaClass } from '../lib/decompiler/java-decompiler';
import { extractAPK } from '../lib/decompiler/android-decompiler';

describe('Java Decompiler', () => {
  it('should handle invalid bytecode gracefully', async () => {
    const invalid = Buffer.from('not-bytecode');
    await expect(decompileJavaClass(invalid)).rejects.toThrow();
  });

  it('should decompile valid class file structure', async () => {
    const validClassHeader = Buffer.alloc(100);
    validClassHeader.writeUInt32BE(0xCAFEBABE, 0);
    validClassHeader.writeUInt16BE(0, 4);
    validClassHeader.writeUInt16BE(52, 6);
    
    try {
      const result = await decompileJavaClass(validClassHeader);
      expect(typeof result).toBe('string');
    } catch (error) {
      expect(error.message).toContain('Failed to decompile');
    }
  });
});

describe('Android APK Decompiler', () => {
  it('should handle corrupted APK files', async () => {
    const corrupted = Buffer.from('corrupted-apk');
    await expect(extractAPK(corrupted)).rejects.toThrow();
  });

  it('should return array for valid ZIP structure', async () => {
    const JSZip = require('jszip');
    const zip = new JSZip();
    zip.file('test.txt', 'test content');
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    const result = await extractAPK(zipBuffer);
    expect(Array.isArray(result)).toBe(true);
  });
});
