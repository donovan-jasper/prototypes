import { create } from 'zustand';
import { DraftPost } from '../types';

interface StoreState {
  draftPosts: DraftPost[];
  currentDraft: string;
  setCurrentDraft: (content: string) => void;
  saveDraft: () => void;
  clearDraft: () => void;
  deleteDraft: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  draftPosts: [],
  currentDraft: '',
  
  setCurrentDraft: (content: string) => {
    set({ currentDraft: content });
  },
  
  saveDraft: () => {
    const { currentDraft, draftPosts } = get();
    if (!currentDraft.trim()) return;
    
    const newDraft: DraftPost = {
      id: Date.now().toString(),
      content: currentDraft,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set({
      draftPosts: [newDraft, ...draftPosts],
      currentDraft: '',
    });
  },
  
  clearDraft: () => {
    set({ currentDraft: '' });
  },
  
  deleteDraft: (id: string) => {
    set((state) => ({
      draftPosts: state.draftPosts.filter((draft) => draft.id !== id),
    }));
  },
}));
