import { decompileJavaClass } from './java-decompiler';
import { extractAPK } from './android-decompiler';
import { parseJSBundle } from './js-decompiler';

interface DecompilationResult {
  files: Array<{ path: string; content: string }>;
  code: string;
}

export const decompileFile = async (fileContent: string): Promise<DecompilationResult> => {
  const buffer = Buffer.from(fileContent, 'base64');
  const fileType = detectFileType(buffer);

  let files: Array<{ path: string; content: string }> = [];
  let code = '';

  switch (fileType) {
    case 'java-class':
      code = await decompileJavaClass(buffer);
      files = [{ path: 'DecompiledClass.java', content: code }];
      break;
    case 'android-apk':
    case 'jar':
      files = await extractAPK(buffer);
      code = files.map(f => f.content).join('\n\n');
      break;
    case 'js-bundle':
      const jsResult = await parseJSBundle(buffer);
      files = jsResult.files;
      code = jsResult.code;
      break;
    default:
      throw new Error('Unsupported file type');
  }

  return { files, code };
};

const detectFileType = (buffer: Buffer): string => {
  // Check magic bytes for .class files (0xCAFEBABE)
  if (buffer.length >= 4 && buffer.readUInt32BE(0) === 0xCAFEBABE) {
    return 'java-class';
  }

  // Check for ZIP/APK/JAR files (PK signature)
  if (buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4B) {
    // Try to determine if it's APK or JAR by checking for AndroidManifest.xml
    const header = buffer.toString('utf8', 0, Math.min(1000, buffer.length));
    if (header.includes('AndroidManifest')) {
      return 'android-apk';
    }
    return 'jar';
  }

  // Check for DEX files (dex\n)
  if (buffer.length >= 4 && buffer.toString('ascii', 0, 4) === 'dex\n') {
    return 'android-dex';
  }

  // Check for Metro bundle format (JavaScript)
  const header = buffer.toString('utf8', 0, Math.min(200, buffer.length));
  if (header.includes('__d(function') || header.includes('__r(') || header.includes('__metro')) {
    return 'js-bundle';
  }

  // Check file extension patterns in header
  if (header.includes('.js') || header.includes('function') || header.includes('module.exports')) {
    return 'js-bundle';
  }

  throw new Error('Unknown file type');
};
