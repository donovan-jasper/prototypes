import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export class FileSystemService {
  static async getRepositoryPath(repoId: string): Promise<string> {
    const baseDir = Platform.OS === 'ios'
      ? FileSystem.documentDirectory || FileSystem.cacheDirectory
      : FileSystem.documentDirectory || FileSystem.cacheDirectory;

    if (!baseDir) {
      throw new Error('No suitable directory found for file storage');
    }

    return `${baseDir}repositories/${repoId}`;
  }

  static async createDirectory(path: string): Promise<void> {
    try {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        // Directory already exists, which is fine
        return;
      }
      throw error;
    }
  }

  static async deleteDirectory(path: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(path, { idempotent: true });
    } catch (error) {
      console.error('Error deleting directory:', error);
      throw error;
    }
  }

  static async directoryExists(path: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      return info.exists && info.isDirectory;
    } catch (error) {
      console.error('Error checking directory existence:', error);
      return false;
    }
  }

  static getFileSystem() {
    return {
      promises: {
        readdir: async (path: string) => {
          const result = await FileSystem.readDirectoryAsync(path);
          return result.map(item => ({
            name: item,
            path: `${path}/${item}`
          }));
        },
        stat: async (path: string) => {
          const info = await FileSystem.getInfoAsync(path);
          return {
            isDirectory: () => info.isDirectory,
            isFile: () => !info.isDirectory,
            size: info.size,
            mtimeMs: info.modificationTime
          };
        },
        readFile: async (path: string, encoding: string) => {
          const content = await FileSystem.readAsStringAsync(path);
          return encoding === 'utf8' ? content : Buffer.from(content);
        },
        writeFile: async (path: string, content: string | Buffer) => {
          const fileContent = typeof content === 'string' ? content : content.toString('utf8');
          await FileSystem.writeAsStringAsync(path, fileContent);
        },
        mkdir: async (path: string) => {
          await FileSystem.makeDirectoryAsync(path, { intermediates: true });
        },
        rmdir: async (path: string) => {
          await FileSystem.deleteAsync(path, { idempotent: true });
        },
        unlink: async (path: string) => {
          await FileSystem.deleteAsync(path, { idempotent: true });
        }
      }
    };
  }
}
