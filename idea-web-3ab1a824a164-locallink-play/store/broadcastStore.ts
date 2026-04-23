import { create } from 'zustand';
import { supabase } from '../lib/supabase';
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
  loading: boolean;
  error: string | null;
  setBroadcasts: (broadcasts: Broadcast[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  subscribeToBroadcasts: (
    location: { lat: number; lng: number },
    radius: number,
    callback: (broadcasts: Broadcast[]) => void
  ) => { unsubscribe: () => void };
  unsubscribeFromBroadcasts: () => void;
  fetchBroadcasts: (location: { lat: number; lng: number }, radius: number) => Promise<void>;
}

export const useBroadcastStore = create<BroadcastStore>((set, get) => ({
  broadcasts: [],
  loading: false,
  error: null,
  setBroadcasts: (broadcasts) => set({ broadcasts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchBroadcasts: async (location, radius) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .rpc('get_nearby_broadcasts', {
          user_lat: location.lat,
          user_lng: location.lng,
          search_radius: radius
        });

      if (error) throw error;

      // Calculate distance for each broadcast
      const broadcastsWithDistance = data.map(broadcast => ({
        ...broadcast,
        distance: calculateDistance(
          location,
          { lat: broadcast.lat, lng: broadcast.lng }
        )
      }));

      // Sort broadcasts
      const sortedBroadcasts = getFilteredAndRankedBroadcasts(
        broadcastsWithDistance,
        location,
        radius
      );

      set({ broadcasts: sortedBroadcasts });
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
      set({ error: 'Failed to load broadcasts' });
    } finally {
      set({ loading: false });
    }
  },

  subscribeToBroadcasts: (location, radius, callback) => {
    // Initial fetch
    get().fetchBroadcasts(location, radius);

    const channel = supabase
      .channel('broadcasts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broadcasts',
        },
        (payload) => {
          // Refresh all broadcasts when any change occurs
          get().fetchBroadcasts(location, radius).then(() => {
            callback(get().broadcasts);
          });
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },

  unsubscribeFromBroadcasts: () => {
    supabase.removeAllChannels();
  },
}));
