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

export class CloneService {
  static async cloneRepository(options: CloneOptions): Promise<void> {
    const { url, repoId, authToken, onProgress } = options;

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

    } catch (error) {
      // Clean up if clone failed
      try {
        await FileSystemService.deleteDirectory(repoPath);
      } catch (cleanupError) {
        console.error('Failed to clean up after clone failure:', cleanupError);
      }

      // Re-throw the original error
      throw error;
    }
  }

  static async deleteRepository(repoId: string): Promise<void> {
    try {
      // Delete from filesystem
      const repoPath = await FileSystemService.getRepositoryPath(repoId);
      await FileSystemService.deleteDirectory(repoPath);

      // Delete from database
      await DatabaseService.deleteRepository(repoId);
    } catch (error) {
      console.error('Error deleting repository:', error);
      throw error;
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
      throw error;
    }
  }

  static async getCloneProgress(repoId: string): Promise<CloneProgress | null> {
    try {
      return await GitService.getCloneProgress(repoId);
    } catch (error) {
      console.error('Error getting clone progress:', error);
      return null;
    }
  }

  static async cancelClone(repoId: string): Promise<void> {
    try {
      await GitService.cancelClone(repoId);
      // Clean up partial clone
      const repoPath = await FileSystemService.getRepositoryPath(repoId);
      await FileSystemService.deleteDirectory(repoPath);
    } catch (error) {
      console.error('Error canceling clone:', error);
      throw error;
    }
  }
}
