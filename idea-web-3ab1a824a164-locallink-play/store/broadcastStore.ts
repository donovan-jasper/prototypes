import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Broadcast } from '../types';
import { Coordinates, calculateDistance } from '../lib/location';
import { getFilteredAndRankedBroadcasts } from '../lib/matching';

interface BroadcastStore {
  broadcasts: Broadcast[];
  loading: boolean;
  userLocation: Coordinates | null;
  setUserLocation: (location: Coordinates) => void;
  fetchBroadcasts: (radiusMiles: number) => Promise<void>;
  expressInterest: (broadcastId: string) => Promise<void>;
}

export const useBroadcastStore = create<BroadcastStore>((set, get) => ({
  broadcasts: [],
  loading: false,
  userLocation: null,

  setUserLocation: (location) => set({ userLocation: location }),

  fetchBroadcasts: async (radiusMiles: number) => {
    const { userLocation } = get();
    if (!userLocation) return;

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('broadcasts')
        .select(`
          id,
          activity,
          description,
          lat,
          lng,
          group_size,
          expires_at,
          created_at,
          user_id,
          is_premium,
          profiles!inner(name)
        `)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const broadcastsWithDistance = (data || []).map((broadcast) => {
        const distance = calculateDistance(
          userLocation,
          { lat: broadcast.lat, lng: broadcast.lng }
        );

        return {
          id: broadcast.id,
          activity: broadcast.activity,
          description: broadcast.description,
          distance,
          expiresAt: broadcast.expires_at,
          createdAt: broadcast.created_at,
          groupSize: broadcast.group_size,
          userId: broadcast.user_id,
          userName: broadcast.profiles.name,
          lat: broadcast.lat,
          lng: broadcast.lng,
          isPremium: broadcast.is_premium,
        };
      });

      const filteredAndRanked = getFilteredAndRankedBroadcasts(
        broadcastsWithDistance,
        userLocation,
        radiusMiles
      );

      set({ broadcasts: filteredAndRanked, loading: false });
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
      set({ loading: false });
    }
  },

  expressInterest: async (broadcastId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      // Create chat room entry
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('broadcast_id', broadcastId)
        .eq('interested_user_id', user.id)
        .single();

      if (!existingChat) {
        const { error } = await supabase.from('chats').insert({
          broadcast_id: broadcastId,
          creator_user_id: user.id, // Assuming current user is the creator
          interested_user_id: user.id, // This needs to be the actual interested user
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      // Update UI state
      set((state) => ({
        broadcasts: state.broadcasts.map((b) =>
          b.id === broadcastId ? { ...b, interested: true } : b
        ),
      }));
    } catch (error) {
      console.error('Error expressing interest:', error);
    }
  },
}));
