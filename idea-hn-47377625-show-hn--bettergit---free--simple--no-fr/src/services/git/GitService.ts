import * as FileSystem from 'expo-file-system';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { FileSystemAdapter } from './FileSystemAdapter';

export interface CloneProgress {
  phase: string;
  loaded: number;
  total: number;
}

export class GitService {
  private static getRepoDir(repoId: string): string {
    return `${FileSystem.documentDirectory}repos/${repoId}`;
  }

  static async clone(
    url: string,
    repoId: string,
    onProgress?: (progress: CloneProgress) => void
  ): Promise<void> {
    const dir = this.getRepoDir(repoId);

    // Ensure repos directory exists
    const reposDir = `${FileSystem.documentDirectory}repos`;
    const dirInfo = await FileSystem.getInfoAsync(reposDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(reposDir, { intermediates: true });
    }

    await git.clone({
      fs: FileSystemAdapter,
      http,
      dir,
      url,
      singleBranch: true,
      depth: 1,
      onProgress: (progress) => {
        if (onProgress) {
          onProgress({
            phase: progress.phase,
            loaded: progress.loaded,
            total: progress.total,
          });
        }
      },
    });
  }

  static async listFiles(repoId: string, path: string = ''): Promise<string[]> {
    const dir = this.getRepoDir(repoId);
    const fullPath = path ? `${dir}/${path}` : dir;

    try {
      const files = await FileSystem.readDirectoryAsync(fullPath);
      return files.filter((file) => file !== '.git');
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  static async readFile(repoId: string, filePath: string): Promise<string> {
    const dir = this.getRepoDir(repoId);
    const fullPath = `${dir}/${filePath}`;

    try {
      return await FileSystem.readAsStringAsync(fullPath);
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  static async getFileInfo(
    repoId: string,
    filePath: string
  ): Promise<FileSystem.FileInfo> {
    const dir = this.getRepoDir(repoId);
    const fullPath = `${dir}/${filePath}`;

    return await FileSystem.getInfoAsync(fullPath);
  }

  static async deleteRepo(repoId: string): Promise<void> {
    const dir = this.getRepoDir(repoId);
    const dirInfo = await FileSystem.getInfoAsync(dir);

    if (dirInfo.exists) {
      await FileSystem.deleteAsync(dir, { idempotent: true });
    }
  }

  static async repoExists(repoId: string): Promise<boolean> {
    const dir = this.getRepoDir(repoId);
    const dirInfo = await FileSystem.getInfoAsync(dir);
    return dirInfo.exists;
  }
}
