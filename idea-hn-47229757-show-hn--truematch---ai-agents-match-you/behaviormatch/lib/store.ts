import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  matches: [],
  conversations: [],
  subscriptionStatus: 'free',
  privacySettings: {},

  setUser: (user) => set({ user }),
  setMatches: (matches) => set({ matches }),
  addMatch: (match) => set((state) => ({ matches: [...state.matches, match] })),
  updateMatch: (updatedMatch) => set((state) => ({
    matches: state.matches.map((match) =>
      match.id === updatedMatch.id ? updatedMatch : match
    ),
  })),
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) => set((state) => ({
    conversations: [...state.conversations, conversation],
  })),
  updateConversation: (updatedConversation) => set((state) => ({
    conversations: state.conversations.map((conversation) =>
      conversation.id === updatedConversation.id ? updatedConversation : conversation
    ),
  })),
  setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),
  setPrivacySettings: (settings) => set({ privacySettings: settings }),
  updatePrivacySetting: (key, value) => set((state) => ({
    privacySettings: { ...state.privacySettings, [key]: value },
  })),
}));

export default useStore;
