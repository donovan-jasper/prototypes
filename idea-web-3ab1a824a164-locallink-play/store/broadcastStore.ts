import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { handleInterest } from '../lib/matching';

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
  fetchBroadcasts: (location: { lat: number; lng: number }, radius: number) => Promise<void>;
  fetchUserBroadcasts: () => Promise<void>;
  createBroadcast: (broadcastData: Omit<Broadcast, 'id' | 'userId' | 'userName' | 'createdAt' | 'distance'>) => Promise<void>;
  expressInterest: (broadcastId: string) => Promise<{ chatId: string; isUnlocked: boolean }>;
  subscribeToBroadcasts: (location: { lat: number; lng: number }, radius: number) => () => void;
}

export const useBroadcastStore = create<BroadcastStore>((set, get) => ({
  broadcasts: [],
  userBroadcasts: [],
  loading: false,

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
          is_premium: user.isPremium || false,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to user's broadcasts
      const newBroadcast = {
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
        userBroadcasts: [newBroadcast, ...state.userBroadcasts],
        loading: false,
      }));
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
      // Call the matching function
      const result = await handleInterest(broadcastId, user.id);

      // Update the broadcast in the store to show interest was sent
      set((state) => ({
        broadcasts: state.broadcasts.map((broadcast) =>
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

  subscribeToBroadcasts: (location, radius) => {
    const user = useAuthStore.getState().user;

    const subscription = supabase
      .channel('broadcasts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'broadcasts',
          filter: `user_id.neq.${user?.id}`,
        },
        (payload) => {
          const newBroadcast = payload.new;

          // Calculate distance
          const distance = calculateDistance(
            location,
            { lat: newBroadcast.lat, lng: newBroadcast.lng }
          );

          // Only add if within radius
          if (distance <= radius) {
            set((state) => {
              const existingBroadcast = state.broadcasts.find(b => b.id === newBroadcast.id);
              if (existingBroadcast) return state;

              const broadcastWithDistance = {
                id: newBroadcast.id,
                userId: newBroadcast.user_id,
                userName: newBroadcast.profiles?.name || 'User',
                activity: newBroadcast.activity,
                description: newBroadcast.description,
                groupSize: newBroadcast.group_size,
                lat: newBroadcast.lat,
                lng: newBroadcast.lng,
                distance,
                expiresAt: newBroadcast.expires_at,
                createdAt: newBroadcast.created_at,
                isPremium: newBroadcast.is_premium,
              };

              // Add to beginning of array and rank
              const updatedBroadcasts = [broadcastWithDistance, ...state.broadcasts];
              const filteredAndRanked = getFilteredAndRankedBroadcasts(
                updatedBroadcasts,
                location,
                radius
              );

              return { broadcasts: filteredAndRanked };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  },
}));

// Helper functions
function calculateDistance(
  { lat: lat1, lng: lng1 }: { lat: number; lng: number },
  { lat: lat2, lng: lng2 }: { lat: number; lng: number }
): number {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function filterByRadius(
  broadcasts: Broadcast[],
  userLocation: { lat: number; lng: number },
  radiusMiles: number
): Broadcast[] {
  return broadcasts.filter((broadcast) => {
    const distance = calculateDistance(
      userLocation,
      { lat: broadcast.lat, lng: broadcast.lng }
    );
    return distance <= radiusMiles;
  });
}

function rankMatches(broadcasts: Broadcast[]): Broadcast[] {
  return [...broadcasts].sort((a, b) => {
    // Premium users get boosted higher
    const premiumBoostA = a.isPremium ? -1 : 0;
    const premiumBoostB = b.isPremium ? -1 : 0;

    // Sort by distance first (closer is better)
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }

    // Then by recency (newer is better)
    const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    // Apply premium boost if needed
    if (premiumBoostA !== premiumBoostB) {
      return premiumBoostA - premiumBoostB;
    }

    return timeDiff;
  });
}

function applyPremiumBoost(broadcasts: Broadcast[]): Broadcast[] {
  return broadcasts.map((broadcast) => ({
    ...broadcast,
    // Premium broadcasts get their distance reduced by 20%
    distance: broadcast.isPremium ? broadcast.distance * 0.8 : broadcast.distance,
  }));
}

function getFilteredAndRankedBroadcasts(
  broadcasts: Broadcast[],
  userLocation: { lat: number; lng: number },
  radiusMiles: number
): Broadcast[] {
  const filtered = filterByRadius(broadcasts, userLocation, radiusMiles);
  const withBoost = applyPremiumBoost(filtered);
  return rankMatches(withBoost);
}
