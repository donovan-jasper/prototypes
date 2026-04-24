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
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('Network timeout while cloning repository. Please check your connection and try again.');
        } else if (error.message.includes('authentication') || error.message.includes('401')) {
          throw new Error('Authentication failed. Please check your credentials and try again.');
        } else if (error.message.includes('access') || error.message.includes('403')) {
          throw new Error('You do not have permission to access this repository.');
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          throw new Error('Repository not found. Please verify the URL and try again.');
        }
      }

      // Clean up if clone failed
      try {
        await FileSystemService.deleteDirectory(repoPath);
      } catch (cleanupError) {
        console.error('Failed to clean up after clone failure:', cleanupError);
      }

      // Re-throw the original error with user-friendly message
      throw new Error('Failed to clone repository. Please try again later.');
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

  static async getCloneProgress(repoId: string): Promise<CloneProgress> {
    try {
      // Get the repository path
      const repoPath = await FileSystemService.getRepositoryPath(repoId);

      // Check if repository exists
      const exists = await FileSystemService.directoryExists(repoPath);
      if (!exists) {
        throw new Error('Repository does not exist');
      }

      // Get the current progress from GitService
      const progress = await GitService.getCloneProgress(repoPath);

      // If progress is completed, update the database
      if (progress.stage === 'completed') {
        await DatabaseService.updateRepositoryLastUpdated(repoId, new Date().toISOString());
      }

      return progress;
    } catch (error) {
      console.error('Error getting clone progress:', error);
      throw new Error('Failed to get clone progress');
    }
  }
}
