import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { CuratedList } from '../types/app';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const getCuratedLists = async (): Promise<CuratedList[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'curatedLists'));
    const curatedLists: CuratedList[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      curatedLists.push({
        title: data.title,
        apps: data.apps.map((app: any) => ({
          name: app.name,
          description: app.description,
          appStoreUrl: app.appStoreUrl,
          iconUrl: app.iconUrl || 'https://via.placeholder.com/150'
        }))
      });
    });

    return curatedLists;
  } catch (error) {
    console.error('Error fetching curated lists:', error);
    return [];
  }
};
