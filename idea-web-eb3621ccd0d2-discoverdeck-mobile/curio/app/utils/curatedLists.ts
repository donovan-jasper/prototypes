import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export interface CuratedList {
  id: string;
  title: string;
  description: string;
  apps: App[];
  createdAt: Date;
}

export interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
  rating: number;
  reviewsCount: number;
}

export const getCuratedLists = async (): Promise<CuratedList[]> => {
  try {
    const listsCollection = collection(db, 'curatedLists');
    const listsSnapshot = await getDocs(listsCollection);

    const curatedLists: CuratedList[] = listsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        apps: data.apps.map((app: any) => ({
          id: app.id,
          name: app.name,
          description: app.description,
          category: app.category,
          iconUrl: app.iconUrl,
          appStoreUrl: app.appStoreUrl,
          playStoreUrl: app.playStoreUrl,
          rating: app.rating,
          reviewsCount: app.reviewsCount
        })),
        createdAt: data.createdAt.toDate()
      };
    });

    return curatedLists;
  } catch (error) {
    console.error('Error fetching curated lists:', error);
    // Fallback to mock data if Firestore fails
    return [
      {
        id: 'fallback-1',
        title: 'Top Productivity Apps',
        description: 'Our expert-picked best apps for getting things done',
        apps: [
          {
            id: 'app-1',
            name: 'Notion',
            description: 'All-in-one workspace for notes, tasks, and wikis',
            category: 'productivity',
            iconUrl: 'https://example.com/notion-icon.png',
            appStoreUrl: 'https://apps.apple.com/us/app/notion/id123456789',
            playStoreUrl: 'https://play.google.com/store/apps/details?id=notion',
            rating: 4.5,
            reviewsCount: 12000
          },
          // Add more mock apps as needed
        ],
        createdAt: new Date()
      }
      // Add more fallback lists as needed
    ];
  }
};
