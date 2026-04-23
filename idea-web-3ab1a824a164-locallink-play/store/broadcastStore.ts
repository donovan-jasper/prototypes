import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { calculateDistance, getFilteredAndRankedBroadcasts } from '../lib/matching';

interface Broadcast {
  id: string;
  userId: string;
  userName: string;
  activity: string;
  description?: string;
  groupSize: number;
  lat: number;
  lng: number;
  distance: number;
  expiresAt: string;
  createdAt: string;
  isPremium: boolean;
  interested?: boolean;
}

interface BroadcastStore {
  broadcasts: Broadcast[];
  userBroadcasts: Broadcast[];
  loading: boolean;
  setBroadcasts: (broadcasts: Broadcast[]) => void;
  setLoading: (loading: boolean) => void;
  fetchBroadcasts: (location: { lat: number; lng: number }, radius: number) => Promise<void>;
  fetchUserBroadcasts: () => Promise<void>;
  createBroadcast: (broadcastData: Omit<Broadcast, 'id' | 'userId' | 'userName' | 'createdAt' | 'distance'>) => Promise<void>;
  expressInterest: (broadcastId: string) => Promise<{ chatId: string; isUnlocked: boolean }>;
  subscribeToBroadcasts: (
    location: { lat: number; lng: number },
    radius: number,
    callback: (broadcasts: Broadcast[]) => void
  ) => { unsubscribe: () => void };
  unsubscribeFromBroadcasts: () => void;
}

export const useBroadcastStore = create<BroadcastStore>((set, get) => {
  let broadcastSubscription: any = null;

  return {
    broadcasts: [],
    userBroadcasts: [],
    loading: false,

    setBroadcasts: (broadcasts) => set({ broadcasts }),
    setLoading: (loading) => set({ loading }),

    fetchBroadcasts: async (location, radius) => {
      set({ loading: true });
      const user = useAuthStore.getState().user;

      try {
        const { data, error } = await supabase
          .from('broadcasts')
          .select(`
            id,
            user_id,
            activity,
            description,
            group_size,
            lat,
            lng,
            expires_at,
            created_at,
            is_premium,
            profiles (name)
          `)
          .neq('user_id', user?.id)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate distance for each broadcast
        const broadcastsWithDistance = (data || []).map((broadcast) => {
          const distance = calculateDistance(
            location,
            { lat: broadcast.lat, lng: broadcast.lng }
          );

          return {
            id: broadcast.id,
            userId: broadcast.user_id,
            userName: broadcast.profiles.name,
            activity: broadcast.activity,
            description: broadcast.description,
            groupSize: broadcast.group_size,
            lat: broadcast.lat,
            lng: broadcast.lng,
            distance,
            expiresAt: broadcast.expires_at,
            createdAt: broadcast.created_at,
            isPremium: broadcast.is_premium,
          };
        });

        // Filter by radius and rank
        const filteredAndRanked = getFilteredAndRankedBroadcasts(
          broadcastsWithDistance,
          location,
          radius
        );

        set({ broadcasts: filteredAndRanked, loading: false });
      } catch (error) {
        console.error('Error fetching broadcasts:', error);
        set({ loading: false });
      }
    },

    fetchUserBroadcasts: async () => {
      set({ loading: true });
      const user = useAuthStore.getState().user;

      if (!user) {
        set({ userBroadcasts: [], loading: false });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('broadcasts')
          .select(`
            id,
            user_id,
            activity,
            description,
            group_size,
            lat,
            lng,
            expires_at,
            created_at,
            is_premium
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const userBroadcasts = (data || []).map((broadcast) => ({
          id: broadcast.id,
          userId: broadcast.user_id,
          userName: user.name || 'You',
          activity: broadcast.activity,
          description: broadcast.description,
          groupSize: broadcast.group_size,
          lat: broadcast.lat,
          lng: broadcast.lng,
          distance: 0, // User's own broadcasts
          expiresAt: broadcast.expires_at,
          createdAt: broadcast.created_at,
          isPremium: broadcast.is_premium,
        }));

        set({ userBroadcasts, loading: false });
      } catch (error) {
        console.error('Error fetching user broadcasts:', error);
        set({ loading: false });
      }
    },

    createBroadcast: async (broadcastData) => {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      set({ loading: true });

      try {
        // Check daily limit for free users
        if (!user.isPremium) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const { count, error: countError } = await supabase
            .from('broadcasts')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString());

          if (countError) throw countError;

          if (count && count >= 3) {
            throw new Error('Daily broadcast limit reached. Upgrade to premium for unlimited broadcasts.');
          }
        }

        const { data, error } = await supabase
          .from('broadcasts')
          .insert({
            user_id: user.id,
            activity: broadcastData.activity,
            description: broadcastData.description,
            group_size: broadcastData.groupSize,
            lat: broadcastData.lat,
            lng: broadcastData.lng,
            expires_at: broadcastData.expiresAt,
            is_premium: user.isPremium,
          })
          .select()
          .single();

        if (error) throw error;

        // Add to user's broadcasts
        const newUserBroadcast = {
          id: data.id,
          userId: user.id,
          userName: user.name || 'You',
          activity: data.activity,
          description: data.description,
          groupSize: data.group_size,
          lat: data.lat,
          lng: data.lng,
          distance: 0,
          expiresAt: data.expires_at,
          createdAt: data.created_at,
          isPremium: data.is_premium,
        };

        set((state) => ({
          userBroadcasts: [newUserBroadcast, ...state.userBroadcasts],
          loading: false,
        }));

        return data;
      } catch (error) {
        console.error('Error creating broadcast:', error);
        set({ loading: false });
        throw error;
      }
    },

    expressInterest: async (broadcastId) => {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      try {
        const result = await expressInterest(broadcastId, user.id);

        // Update the broadcasts list to reflect the interest
        set((state) => ({
          broadcasts: state.broadcasts.map(broadcast =>
            broadcast.id === broadcastId
              ? { ...broadcast, interested: true }
              : broadcast
          ),
        }));

        return result;
      } catch (error) {
        console.error('Error expressing interest:', error);
        throw error;
      }
    },

    subscribeToBroadcasts: (location, radius, callback) => {
      // Unsubscribe from any existing subscription
      if (broadcastSubscription) {
        broadcastSubscription.unsubscribe();
      }

      // Create a new subscription
      broadcastSubscription = supabase
        .channel('broadcasts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'broadcasts',
          },
          async (payload) => {
            try {
              // Fetch the new broadcast with profile data
              const { data, error } = await supabase
                .from('broadcasts')
                .select(`
                  id,
                  user_id,
                  activity,
                  description,
                  group_size,
                  lat,
                  lng,
                  expires_at,
                  created_at,
                  is_premium,
                  profiles (name)
                `)
                .eq('id', payload.new.id)
                .single();

              if (error) throw error;

              // Calculate distance
              const distance = calculateDistance(
                location,
                { lat: data.lat, lng: data.lng }
              );

              // Check if within radius
              if (distance <= radius) {
                const newBroadcast = {
                  id: data.id,
                  userId: data.user_id,
                  userName: data.profiles.name,
                  activity: data.activity,
                  description: data.description,
                  groupSize: data.group_size,
                  lat: data.lat,
                  lng: data.lng,
                  distance,
                  expiresAt: data.expires_at,
                  createdAt: data.created_at,
                  isPremium: data.is_premium,
                };

                // Update the store and call the callback
                set((state) => {
                  const updatedBroadcasts = [newBroadcast, ...state.broadcasts];
                  const filteredAndRanked = getFilteredAndRankedBroadcasts(
                    updatedBroadcasts,
                    location,
                    radius
                  );
                  return { broadcasts: filteredAndRanked };
                });

                callback([newBroadcast, ...get().broadcasts]);
              }
            } catch (error) {
              console.error('Error processing new broadcast:', error);
            }
          }
        )
        .subscribe();

      return {
        unsubscribe: () => {
          if (broadcastSubscription) {
            broadcastSubscription.unsubscribe();
            broadcastSubscription = null;
          }
        }
      };
    },

    unsubscribeFromBroadcasts: () => {
      if (broadcastSubscription) {
        broadcastSubscription.unsubscribe();
        broadcastSubscription = null;
      }
    },
  };
});
