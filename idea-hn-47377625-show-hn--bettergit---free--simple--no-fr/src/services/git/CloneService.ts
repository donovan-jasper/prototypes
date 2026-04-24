import { GitService, CloneProgress } from './GitService';
import { GitProviderService } from './GitProviderService';

export interface CloneOptions {
  url: string;
  repoId: string;
  authToken?: string;
  onProgress?: (progress: CloneProgress) => void;
}

export class CloneService {
  static async cloneRepository(options: CloneOptions): Promise<void> {
    const { url, repoId, authToken, onProgress } = options;

    // Validate the repository URL
    const isValid = await GitProviderService.validateRepositoryUrl(url);
    if (!isValid) {
      throw new Error('Invalid repository URL');
    }

    // Check if repo already exists
    const exists = await GitService.repoExists(repoId);
    if (exists) {
      throw new Error('Repository already cloned');
    }

    // Clone the repository with auth if provided
    await GitService.clone({
      url,
      dir: repoId,
      authToken,
      onProgress
    });
  }

  static async deleteRepository(repoId: string): Promise<void> {
    await GitService.deleteRepo(repoId);
  }

  static async isRepositoryCloned(repoId: string): Promise<boolean> {
    return await GitService.repoExists(repoId);
  }

  static async getRepositoryInfo(url: string, authToken?: string): Promise<any> {
    const provider = await GitProviderService.detectProvider(url);
    if (!provider) {
      throw new Error('Unsupported Git provider');
    }

    return await GitProviderService.getRepositoryInfo(url, authToken ? { provider, token: authToken } : undefined);
  }
}
