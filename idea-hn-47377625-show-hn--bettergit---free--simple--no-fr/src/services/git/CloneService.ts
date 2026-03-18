import { GitService, CloneProgress } from './GitService';

export interface CloneOptions {
  url: string;
  repoId: string;
  onProgress?: (progress: CloneProgress) => void;
}

export class CloneService {
  static async cloneRepository(options: CloneOptions): Promise<void> {
    const { url, repoId, onProgress } = options;

    // Check if repo already exists
    const exists = await GitService.repoExists(repoId);
    if (exists) {
      throw new Error('Repository already cloned');
    }

    // Clone the repository
    await GitService.clone(url, repoId, onProgress);
  }

  static async deleteRepository(repoId: string): Promise<void> {
    await GitService.deleteRepo(repoId);
  }

  static async isRepositoryCloned(repoId: string): Promise<boolean> {
    return await GitService.repoExists(repoId);
  }
}
