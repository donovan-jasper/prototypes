import { create } from 'zustand';

export interface Repository {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  languageColor: string;
  url: string;
  isCloned: boolean;
  cloneProgress?: number;
}

interface RepositoryStore {
  repositories: Repository[];
  updateRepository: (id: string, updates: Partial<Repository>) => void;
  setCloneProgress: (id: string, progress: number) => void;
  setCloned: (id: string, isCloned: boolean) => void;
}

export const useRepositoryStore = create<RepositoryStore>((set) => ({
  repositories: [
    {
      id: '1',
      name: 'marketing-site',
      description: 'Company marketing website built with Next.js and Tailwind CSS',
      stars: 42,
      forks: 8,
      language: 'TypeScript',
      languageColor: '#3178c6',
      url: 'https://github.com/vercel/next.js',
      isCloned: false,
    },
    {
      id: '2',
      name: 'backend-api',
      description: 'RESTful API service for mobile and web applications',
      stars: 156,
      forks: 23,
      language: 'Python',
      languageColor: '#3572A5',
      url: 'https://github.com/pallets/flask',
      isCloned: false,
    },
    {
      id: '3',
      name: 'design-system',
      description: 'Shared component library and design tokens',
      stars: 89,
      forks: 12,
      language: 'JavaScript',
      languageColor: '#f1e05a',
      url: 'https://github.com/facebook/react',
      isCloned: false,
    },
    {
      id: '4',
      name: 'mobile-app',
      description: 'React Native mobile application for iOS and Android',
      stars: 234,
      forks: 45,
      language: 'TypeScript',
      languageColor: '#3178c6',
      url: 'https://github.com/expo/expo',
      isCloned: false,
    },
    {
      id: '5',
      name: 'docs',
      description: 'Product documentation and API reference',
      stars: 67,
      forks: 34,
      language: 'Markdown',
      languageColor: '#083fa1',
      url: 'https://github.com/facebook/docusaurus',
      isCloned: false,
    },
  ],
  updateRepository: (id, updates) =>
    set((state) => ({
      repositories: state.repositories.map((repo) =>
        repo.id === id ? { ...repo, ...updates } : repo
      ),
    })),
  setCloneProgress: (id, progress) =>
    set((state) => ({
      repositories: state.repositories.map((repo) =>
        repo.id === id ? { ...repo, cloneProgress: progress } : repo
      ),
    })),
  setCloned: (id, isCloned) =>
    set((state) => ({
      repositories: state.repositories.map((repo) =>
        repo.id === id ? { ...repo, isCloned, cloneProgress: undefined } : repo
      ),
    })),
}));
