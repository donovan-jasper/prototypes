import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface AppRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  iconUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
  rating: number;
  reviewCount: number;
  expertRating?: number;
  isFeatured?: boolean;
}

const mockApps: AppRecommendation[] = [
  {
    id: '1',
    name: 'Notion',
    description: 'All-in-one workspace for notes, tasks, and wikis',
    category: 'productivity',
    tags: ['notes', 'tasks', 'organization'],
    iconUrl: 'https://example.com/notion-icon.png',
    appStoreUrl: 'https://apps.apple.com/us/app/notion/id123456789',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=notion',
    rating: 4.5,
    reviewCount: 12000,
    expertRating: 4.8,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Trello',
    description: 'Visual project management tool',
    category: 'productivity',
    tags: ['tasks', 'project management', 'collaboration'],
    iconUrl: 'https://example.com/trello-icon.png',
    appStoreUrl: 'https://apps.apple.com/us/app/trello/id987654321',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=trello',
    rating: 4.3,
    reviewCount: 8000,
    expertRating: 4.6,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Headspace',
    description: 'Meditation and mindfulness app',
    category: 'health',
    tags: ['meditation', 'mental health', 'wellness'],
    iconUrl: 'https://example.com/headspace-icon.png',
    appStoreUrl: 'https://apps.apple.com/us/app/headspace/id123456789',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=headspace',
    rating: 4.7,
    reviewCount: 15000,
    expertRating: 4.9,
    isFeatured: true
  },
  {
    id: '4',
    name: 'Duolingo',
    description: 'Language learning app',
    category: 'education',
    tags: ['language', 'learning', 'gamification'],
    iconUrl: 'https://example.com/duolingo-icon.png',
    appStoreUrl: 'https://apps.apple.com/us/app/duolingo/id123456789',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=duolingo',
    rating: 4.6,
    reviewCount: 20000,
    expertRating: 4.7
  }
];

export const getRecommendations = async (
  searchTerm: string = '',
  category: string = '',
  limitCount: number = 10
): Promise<{ data: AppRecommendation[]; loading: boolean; error: string | null }> => {
  try {
    // For MVP, we'll use mock data until Firebase is fully set up
    let filteredApps = [...mockApps];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredApps = filteredApps.filter(app =>
        app.name.toLowerCase().includes(lowerSearch) ||
        app.description.toLowerCase().includes(lowerSearch) ||
        app.category.toLowerCase().includes(lowerSearch) ||
        app.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    } else if (category) {
      filteredApps = filteredApps.filter(app =>
        app.category.toLowerCase() === category.toLowerCase()
      );
    } else {
      // Default to featured apps if no search or category
      filteredApps = filteredApps.filter(app => app.isFeatured);
    }

    // Sort by expert rating if available, otherwise by regular rating
    filteredApps.sort((a, b) => {
      const aRating = a.expertRating || a.rating;
      const bRating = b.expertRating || b.rating;
      return bRating - aRating;
    });

    // Apply limit
    filteredApps = filteredApps.slice(0, limitCount);

    return { data: filteredApps, loading: false, error: null };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { data: [], loading: false, error: 'Failed to fetch recommendations' };
  }
};
