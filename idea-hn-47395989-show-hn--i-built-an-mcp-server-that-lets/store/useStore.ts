import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Account, DraftPost, ScheduledPost } from '../types';

interface AppState {
  accounts: Account[];
  draftPosts: DraftPost[];
  scheduledPosts: ScheduledPost[];
  currentAccountId: string | null;
  addAccount: (account: Account) => void;
  removeAccount: (accountId: string) => void;
  setCurrentAccount: (accountId: string) => void;
  addDraftPost: (post: DraftPost) => void;
  removeDraftPost: (postId: string) => void;
  addScheduledPost: (post: ScheduledPost) => void;
  updateScheduledPost: (postId: string, updates: Partial<ScheduledPost>) => void;
  removeScheduledPost: (postId: string) => void;
}

const secureStorage = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      accounts: [],
      draftPosts: [],
      scheduledPosts: [],
      currentAccountId: null,

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, account],
          currentAccountId: account.id,
        })),

      removeAccount: (accountId) =>
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== accountId),
          currentAccountId: state.currentAccountId === accountId ? null : state.currentAccountId,
        })),

      setCurrentAccount: (accountId) =>
        set(() => ({
          currentAccountId: accountId,
        })),

      addDraftPost: (post) =>
        set((state) => ({
          draftPosts: [...state.draftPosts, post],
        })),

      removeDraftPost: (postId) =>
        set((state) => ({
          draftPosts: state.draftPosts.filter((post) => post.id !== postId),
        })),

      addScheduledPost: (post) =>
        set((state) => ({
          scheduledPosts: [...state.scheduledPosts, post],
        })),

      updateScheduledPost: (postId, updates) =>
        set((state) => ({
          scheduledPosts: state.scheduledPosts.map((post) =>
            post.id === postId ? { ...post, ...updates } : post
          ),
        })),

      removeScheduledPost: (postId) =>
        set((state) => ({
          scheduledPosts: state.scheduledPosts.filter((post) => post.id !== postId),
        })),
    }),
    {
      name: 'threadflow-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        currentAccountId: state.currentAccountId,
        // Don't persist drafts and scheduled posts to avoid clutter
      }),
    }
  )
);
