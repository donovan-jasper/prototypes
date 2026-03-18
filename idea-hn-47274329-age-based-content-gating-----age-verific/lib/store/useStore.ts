import { create } from 'zustand';

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  profileType: 'toddler' | 'kid' | 'teen' | 'adult';
  createdAt: number;
}

interface StoreState {
  profiles: ChildProfile[];
  activeProfileId: string | null;
  addProfile: (profile: Omit<ChildProfile, 'id' | 'createdAt'>) => void;
  selectProfile: (profileId: string) => void;
  removeProfile: (profileId: string) => void;
  updateProfile: (profileId: string, updates: Partial<ChildProfile>) => void;
}

export const useStore = create<StoreState>((set) => ({
  profiles: [
    {
      id: '1',
      name: 'Emma',
      age: 7,
      profileType: 'kid',
      createdAt: Date.now() - 86400000 * 30,
    },
    {
      id: '2',
      name: 'Lucas',
      age: 14,
      profileType: 'teen',
      createdAt: Date.now() - 86400000 * 15,
    },
  ],
  activeProfileId: null,

  addProfile: (profile) =>
    set((state) => ({
      profiles: [
        ...state.profiles,
        {
          ...profile,
          id: Date.now().toString(),
          createdAt: Date.now(),
        },
      ],
    })),

  selectProfile: (profileId) =>
    set(() => ({
      activeProfileId: profileId,
    })),

  removeProfile: (profileId) =>
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== profileId),
      activeProfileId: state.activeProfileId === profileId ? null : state.activeProfileId,
    })),

  updateProfile: (profileId, updates) =>
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === profileId ? { ...p, ...updates } : p
      ),
    })),
}));
