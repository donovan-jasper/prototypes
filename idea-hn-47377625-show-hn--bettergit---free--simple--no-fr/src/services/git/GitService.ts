import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { FileSystemService } from '../storage/FileSystemService';

export interface CloneProgress {
  percent: number;
  currentFile?: string;
  totalFiles?: number;
  totalSize?: number;
  receivedSize?: number;
}

export interface CloneOptions {
  url: string;
  dir: string;
  authToken?: string;
  onProgress?: (progress: CloneProgress) => void;
}

export class GitService {
  static async clone(options: CloneOptions): Promise<void> {
    const { url, dir, authToken, onProgress } = options;

    const fs = FileSystemService.getFileSystem();

    let totalObjects = 0;
    let receivedObjects = 0;
    let currentFile: string | undefined;
    let totalSize = 0;
    let receivedSize = 0;

    try {
      await git.clone({
        fs,
        http,
        dir,
        url,
        onProgress: (progress) => {
          if (progress.total) {
            totalObjects = progress.total;
            receivedObjects = progress.loaded;
          }

          if (progress.objects) {
            totalSize = progress.objects.size;
            receivedSize = progress.objects.transferred;
          }

          if (progress.phase === 'receiving objects') {
            currentFile = progress.currentFile;
          }

          const percent = totalObjects > 0
            ? Math.round((receivedObjects / totalObjects) * 100)
            : 0;

          if (onProgress) {
            onProgress({
              percent,
              currentFile,
              totalFiles: totalObjects,
              totalSize,
              receivedSize
            });
          }
        },
        onAuth: () => {
          if (authToken) {
            return {
              username: 'oauth2',
              password: authToken
            };
          }
          return undefined;
        },
        onMessage: (message) => {
          console.log('Git message:', message);
        },
        onError: (error) => {
          console.error('Git error:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Clone failed:', error);
      throw error;
    }
  }

  static async repoExists(repoId: string): Promise<boolean> {
    const repoPath = await FileSystemService.getRepositoryPath(repoId);
    return await FileSystemService.directoryExists(repoPath);
  }

  // Other existing methods...
}
