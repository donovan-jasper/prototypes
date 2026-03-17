import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Broadcast } from '../types';
import { Coordinates, calculateDistance } from '../lib/location';

interface BroadcastStore {
  broadcasts: Broadcast[];
  loading: boolean;
  userLocation: Coordinates | null;
  setUserLocation: (location: Coordinates) => void;
  fetchBroadcasts: (radiusMiles: number) => Promise<void>;
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
          user_id,
          profiles!inner(name)
        `)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const broadcastsWithDistance = (data || [])
        .map((broadcast) => {
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
            groupSize: broadcast.group_size,
            userId: broadcast.user_id,
            userName: broadcast.profiles.name,
            lat: broadcast.lat,
            lng: broadcast.lng,
          };
        })
        .filter((broadcast) => broadcast.distance <= radiusMiles)
        .sort((a, b) => a.distance - b.distance);

      set({ broadcasts: broadcastsWithDistance, loading: false });
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
      set({ loading: false });
    }
  },
}));
