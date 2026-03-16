import create from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
  persist(
    (set) => ({
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: 30,
        gender: 'male',
      },
      premium: false,
      setPremium: (premium) => set({ premium }),
    }),
    {
      name: 'lifethread-storage',
      getStorage: () => AsyncStorage,
    }
  )
);

export default useStore;
