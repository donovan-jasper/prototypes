import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { calculateDistance } from '../lib/matching';

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
}

export const useBroadcastStore = create<BroadcastStore>((set, get) => ({
  broadcasts: [],
  loading: false,
  error: null,
  setBroadcasts: (broadcasts) => set({ broadcasts }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  subscribeToBroadcasts: (location, radius, callback) => {
    const channel = supabase
      .channel('broadcasts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'broadcasts',
        },
        (payload) => {
          const newBroadcast = payload.new;
          const distance = calculateDistance(
            location,
            { lat: newBroadcast.lat, lng: newBroadcast.lng }
          );

          if (distance <= radius) {
            // Fetch all broadcasts within radius to maintain proper ordering
            fetchNearbyBroadcasts(location.lat, location.lng, radius)
              .then(broadcasts => {
                callback(broadcasts);
                set({ broadcasts });
              })
              .catch(error => {
                console.error('Error fetching broadcasts:', error);
                set({ error: 'Failed to load broadcasts' });
              });
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchNearbyBroadcasts(location.lat, location.lng, radius)
      .then(broadcasts => {
        callback(broadcasts);
        set({ broadcasts });
      })
      .catch(error => {
        console.error('Error fetching broadcasts:', error);
        set({ error: 'Failed to load broadcasts' });
      });

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

// Helper function to fetch and sort broadcasts
async function fetchNearbyBroadcasts(latitude: number, longitude: number, radius: number) {
  try {
    const { data, error } = await supabase
      .rpc('get_nearby_broadcasts', {
        user_lat: latitude,
        user_lng: longitude,
        search_radius: radius
      });

    if (error) throw error;

    // Calculate distance for each broadcast
    const broadcastsWithDistance = data.map(broadcast => ({
      ...broadcast,
      distance: calculateDistance(
        { lat: latitude, lng: longitude },
        { lat: broadcast.lat, lng: broadcast.lng }
      )
    }));

    // Sort by distance (closest first) and then by recency (newest first)
    return broadcastsWithDistance.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching nearby broadcasts:', error);
    throw error;
  }
}
