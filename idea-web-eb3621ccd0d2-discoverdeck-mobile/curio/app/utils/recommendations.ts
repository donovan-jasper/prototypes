import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const getRecommendations = async (queryText: string) => {
  const q = query(collection(db, 'apps'), where('tags', 'array-contains', queryText));
  const querySnapshot = await getDocs(q);
  const apps = querySnapshot.docs.map(doc => doc.data());
  return apps;
};
