import * as FileSystem from 'expo-file-system';

interface Stats {
  type: 'file' | 'dir' | 'symlink';
  mode: number;
  size: number;
  ino: number;
  mtimeMs: number;
  isFile: () => boolean;
  isDirectory: () => boolean;
  isSymbolicLink: () => boolean;
}

export class FileSystemAdapter {
  private static async ensureDirectory(path: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(path);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  }

  static async readFile(
    filepath: string,
    options?: { encoding?: 'utf8' | null }
  ): Promise<string | Uint8Array> {
    try {
      if (options?.encoding === 'utf8' || options?.encoding === undefined) {
        return await FileSystem.readAsStringAsync(filepath, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } else {
        const base64 = await FileSystem.readAsStringAsync(filepath, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      }
    } catch (error) {
      throw new Error(`Failed to read file ${filepath}: ${error}`);
    }
  }

  static async writeFile(
    filepath: string,
    data: string | Uint8Array,
    options?: { encoding?: 'utf8' | null; mode?: number }
  ): Promise<void> {
    try {
      const dir = filepath.substring(0, filepath.lastIndexOf('/'));
      await this.ensureDirectory(dir);

      if (typeof data === 'string') {
        await FileSystem.writeAsStringAsync(filepath, data, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } else {
        const base64 = btoa(String.fromCharCode(...data));
        await FileSystem.writeAsStringAsync(filepath, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
    } catch (error) {
      throw new Error(`Failed to write file ${filepath}: ${error}`);
    }
  }

  static async unlink(filepath: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(filepath, { idempotent: true });
    } catch (error) {
      throw new Error(`Failed to delete file ${filepath}: ${error}`);
    }
  }

  static async readdir(filepath: string): Promise<string[]> {
    try {
      const info = await FileSystem.getInfoAsync(filepath);
      if (!info.exists) {
        throw new Error(`Directory does not exist: ${filepath}`);
      }
      if (!info.isDirectory) {
        throw new Error(`Not a directory: ${filepath}`);
      }
      return await FileSystem.readDirectoryAsync(filepath);
    } catch (error) {
      throw new Error(`Failed to read directory ${filepath}: ${error}`);
    }
  }

  static async mkdir(filepath: string): Promise<void> {
    try {
      await FileSystem.makeDirectoryAsync(filepath, { intermediates: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${filepath}: ${error}`);
    }
  }

  static async rmdir(filepath: string): Promise<void> {
    try {
      const contents = await FileSystem.readDirectoryAsync(filepath);
      if (contents.length > 0) {
        throw new Error(`Directory not empty: ${filepath}`);
      }
      await FileSystem.deleteAsync(filepath);
    } catch (error) {
      throw new Error(`Failed to remove directory ${filepath}: ${error}`);
    }
  }

  static async stat(filepath: string): Promise<Stats> {
    try {
      const info = await FileSystem.getInfoAsync(filepath, { size: true });
      if (!info.exists) {
        throw new Error(`File does not exist: ${filepath}`);
      }

      const type = info.isDirectory ? 'dir' : 'file';
      const mode = info.isDirectory ? 0o040755 : 0o100644;
      const size = info.size || 0;
      const mtimeMs = info.modificationTime || Date.now();

      return {
        type,
        mode,
        size,
        ino: 0,
        mtimeMs,
        isFile: () => type === 'file',
        isDirectory: () => type === 'dir',
        isSymbolicLink: () => type === 'symlink',
      };
    } catch (error) {
      throw new Error(`Failed to stat ${filepath}: ${error}`);
    }
  }

  static async lstat(filepath: string): Promise<Stats> {
    return this.stat(filepath);
  }

  static async readlink(filepath: string): Promise<string> {
    throw new Error('Symbolic links are not supported on React Native');
  }

  static async symlink(target: string, filepath: string): Promise<void> {
    throw new Error('Symbolic links are not supported on React Native');
  }

  static async chmod(filepath: string, mode: number): Promise<void> {
    // React Native file system doesn't support chmod
    // This is a no-op to maintain compatibility
  }
}
