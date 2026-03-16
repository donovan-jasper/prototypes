import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const getCuratedLists = async () => {
  const querySnapshot = await getDocs(collection(db, 'curatedLists'));
  const lists = querySnapshot.docs.map(doc => doc.data());
  return lists;
};
