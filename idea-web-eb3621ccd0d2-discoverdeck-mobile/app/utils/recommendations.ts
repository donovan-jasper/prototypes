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

export const getRecommendations = async (
  searchTerm: string = '',
  category: string = '',
  limitCount: number = 10
): Promise<{ data: AppRecommendation[]; loading: boolean; error: string | null }> => {
  try {
    let appsCollection = collection(db, 'apps');
    let q = query(appsCollection, limit(limitCount));

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      q = query(
        appsCollection,
        where('searchable', 'array-contains', lowerSearch),
        limit(limitCount)
      );
    } else if (category) {
      q = query(
        appsCollection,
        where('category', '==', category),
        orderBy('expertRating', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        appsCollection,
        where('isFeatured', '==', true),
        orderBy('expertRating', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const apps: AppRecommendation[] = [];

    querySnapshot.forEach((doc) => {
      apps.push({
        id: doc.id,
        ...doc.data()
      } as AppRecommendation);
    });

    return { data: apps, loading: false, error: null };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { data: [], loading: false, error: 'Failed to fetch recommendations' };
  }
};
