import { GitService, CloneProgress } from './GitService';
import { GitProviderService } from './GitProviderService';
import { FileSystemService } from '../storage/FileSystemService';
import { DatabaseService } from '../storage/DatabaseService';

export interface CloneOptions {
  url: string;
  repoId: string;
  authToken?: string;
  onProgress?: (progress: CloneProgress) => void;
}

export interface CloneStatus {
  progress: number;
  currentFile?: string;
  totalFiles?: number;
  totalSize?: number;
  receivedSize?: number;
  error?: string;
  isComplete: boolean;
}

export class CloneService {
  private static activeClones: Map<string, CloneStatus> = new Map();

  static async cloneRepository(options: CloneOptions): Promise<void> {
    const { url, repoId, authToken, onProgress } = options;
    const status: CloneStatus = {
      progress: 0,
      isComplete: false
    };

    this.activeClones.set(repoId, status);

    try {
      // Validate the repository URL
      const isValid = await GitProviderService.validateRepositoryUrl(url);
      if (!isValid) {
        throw new Error('Invalid repository URL');
      }

      // Check if repo already exists
      const exists = await GitService.repoExists(repoId);
      if (exists) {
        throw new Error('Repository already exists');
      }

      // Create directory for the repository
      const repoPath = await FileSystemService.getRepositoryPath(repoId);
      await FileSystemService.createDirectory(repoPath);

      // Clone the repository with auth if provided
      await GitService.clone({
        url,
        dir: repoPath,
        authToken,
        onProgress: (progress) => {
          status.progress = progress.percent;
          status.currentFile = progress.currentFile;
          status.totalFiles = progress.totalFiles;
          status.totalSize = progress.totalSize;
          status.receivedSize = progress.receivedSize;

          if (onProgress) {
            onProgress(progress);
          }
        }
      });

      // Save repository metadata to database
      const repoInfo = await this.getRepositoryInfo(url, authToken);
      await DatabaseService.saveRepository({
        id: repoId,
        name: repoInfo.name,
        fullName: repoInfo.fullName,
        description: repoInfo.description,
        cloneUrl: url,
        defaultBranch: repoInfo.defaultBranch,
        lastUpdated: new Date().toISOString(),
        path: repoPath
      });

      status.isComplete = true;
      status.progress = 100;

    } catch (error) {
      status.error = error instanceof Error ? error.message : 'Unknown error occurred';
      status.isComplete = true;

      // Clean up if clone failed
      try {
        await FileSystemService.deleteDirectory(repoPath);
      } catch (cleanupError) {
        console.error('Failed to clean up after clone failure:', cleanupError);
      }

      // Re-throw the original error with user-friendly message
      throw new Error(status.error || 'Failed to clone repository. Please try again later.');
    } finally {
      this.activeClones.delete(repoId);
    }
  }

  static async deleteRepository(repoId: string): Promise<void> {
    try {
      // Delete from filesystem
      const repoPath = await FileSystemService.getRepositoryPath(repoId);
      await FileSystemService.deleteDirectory(repoPath);

      // Delete from database
      await DatabaseService.deleteRepository(repoId);

      // Remove from active clones if present
      this.activeClones.delete(repoId);
    } catch (error) {
      console.error('Error deleting repository:', error);
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          throw new Error('Permission denied. Unable to delete repository.');
        }
      }
      throw new Error('Failed to delete repository. Please try again.');
    }
  }

  static async isRepositoryCloned(repoId: string): Promise<boolean> {
    try {
      const repoPath = await FileSystemService.getRepositoryPath(repoId);
      return await FileSystemService.directoryExists(repoPath);
    } catch (error) {
      console.error('Error checking repository existence:', error);
      return false;
    }
  }

  static async getRepositoryInfo(url: string, authToken?: string): Promise<any> {
    try {
      const provider = await GitProviderService.detectProvider(url);
      if (!provider) {
        throw new Error('Unsupported Git provider');
      }

      return await GitProviderService.getRepositoryInfo(url, authToken ? { provider, token: authToken } : undefined);
    } catch (error) {
      console.error('Error fetching repository info:', error);
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('Network timeout while fetching repository information.');
        } else if (error.message.includes('authentication') || error.message.includes('401')) {
          throw new Error('Authentication failed. Please check your credentials.');
        }
      }
      throw new Error('Failed to fetch repository information. Please try again.');
    }
  }

  static getCloneProgress(repoId: string): CloneStatus {
    const status = this.activeClones.get(repoId);
    if (!status) {
      return {
        progress: 0,
        isComplete: false,
        error: 'No active clone operation found'
      };
    }
    return status;
  }

  static async cancelClone(repoId: string): Promise<void> {
    try {
      const status = this.activeClones.get(repoId);
      if (status) {
        status.isComplete = true;
        status.error = 'Clone operation was cancelled';
        this.activeClones.delete(repoId);

        // Clean up filesystem
        const repoPath = await FileSystemService.getRepositoryPath(repoId);
        await FileSystemService.deleteDirectory(repoPath);
      }
    } catch (error) {
      console.error('Error cancelling clone:', error);
      throw new Error('Failed to cancel clone operation');
    }
  }
}
