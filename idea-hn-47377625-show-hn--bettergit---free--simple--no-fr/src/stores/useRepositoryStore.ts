import { create } from 'zustand';
import { Repository } from '../types/repository';
import { DatabaseService } from '../services/storage/DatabaseService';

interface RepositoryState {
  repositories: Repository[];
  loading: boolean;
  error: string | null;
  loadRepositories: () => Promise<void>;
  addRepository: (repository: Repository) => void;
  removeRepository: (repoId: string) => void;
  updateRepository: (repoId: string, updates: Partial<Repository>) => void;
}

export const useRepositoryStore = create<RepositoryState>((set) => ({
  repositories: [],
  loading: false,
  error: null,

  loadRepositories: async () => {
    set({ loading: true, error: null });
    try {
      const repositories = await DatabaseService.getAllRepositories();
      set({ repositories, loading: false });
    } catch (error) {
      console.error('Failed to load repositories:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load repositories',
        loading: false
      });
    }
  },

  addRepository: (repository) => {
    set((state) => ({
      repositories: [...state.repositories, repository]
    }));
  },

  removeRepository: (repoId) => {
    set((state) => ({
      repositories: state.repositories.filter(repo => repo.id !== repoId)
    }));
  },

  updateRepository: (repoId, updates) => {
    set((state) => ({
      repositories: state.repositories.map(repo =>
        repo.id === repoId ? { ...repo, ...updates } : repo
      )
    }));
  }
}));
