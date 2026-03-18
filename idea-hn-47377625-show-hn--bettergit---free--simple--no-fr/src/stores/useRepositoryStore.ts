import { create } from 'zustand';

interface Repository {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  languageColor: string;
}

interface RepositoryStore {
  repositories: Repository[];
}

export const useRepositoryStore = create<RepositoryStore>(() => ({
  repositories: [
    {
      id: '1',
      name: 'marketing-site',
      description: 'Company marketing website built with Next.js and Tailwind CSS',
      stars: 42,
      forks: 8,
      language: 'TypeScript',
      languageColor: '#3178c6',
    },
    {
      id: '2',
      name: 'backend-api',
      description: 'RESTful API service for mobile and web applications',
      stars: 156,
      forks: 23,
      language: 'Python',
      languageColor: '#3572A5',
    },
    {
      id: '3',
      name: 'design-system',
      description: 'Shared component library and design tokens',
      stars: 89,
      forks: 12,
      language: 'JavaScript',
      languageColor: '#f1e05a',
    },
    {
      id: '4',
      name: 'mobile-app',
      description: 'React Native mobile application for iOS and Android',
      stars: 234,
      forks: 45,
      language: 'TypeScript',
      languageColor: '#3178c6',
    },
    {
      id: '5',
      name: 'docs',
      description: 'Product documentation and API reference',
      stars: 67,
      forks: 34,
      language: 'Markdown',
      languageColor: '#083fa1',
    },
  ],
}));
