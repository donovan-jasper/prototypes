import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getRSVPCount, getUserRSVPStatus, updateRSVP } from '../lib/activities';
import { useAuth } from '../hooks/useAuth';
import { calculateDistance } from '../lib/distance';

interface ActivityCardProps {
  activity: {
    id: number;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    startTime: string;
    organizerId: number;
    maxAttendees: number | null;
  };
}

const categoryIcons: Record<string, string> = {
  sports: 'sports-soccer',
  food: 'restaurant',
  games: 'games',
  walks: 'directions-walk',
  creative: 'palette',
  fitness: 'fitness-center',
  music: 'music-note',
  learning: 'school',
  other: 'category',
};

export default function ActivityCard({ activity }: ActivityCardProps) {
  const { user } = useAuth();
  const [rsvpCount, setRsvpCount] = useState(0);
  const [userStatus, setUserStatus] = useState<'going' | 'interested' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRSVPData = async () => {
      if (!user) return;

      try {
        const count = await getRSVPCount(activity.id);
        setRsvpCount(count);

        const status = await getUserRSVPStatus(activity.id, user.id);
        setUserStatus(status);
      } catch (err) {
        console.error('Error fetching RSVP data:', err);
      }
    };

    fetchRSVPData();
  }, [activity.id, user]);

  const handleRSVP = async (status: 'going' | 'interested' | 'cancelled') => {
    if (!user) return;

    try {
      setLoading(true);
      await updateRSVP(activity.id, user.id, status);

      // Update local state
      if (status === 'cancelled') {
        setUserStatus(null);
        setRsvpCount(prev => Math.max(0, prev - 1));
      } else {
        setUserStatus(status);
        if (userStatus === null) {
          setRsvpCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error updating RSVP:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const distance = user?.location
    ? calculateDistance(
        user.location.latitude,
        user.location.longitude,
        activity.latitude,
        activity.longitude
      )
    : null;

  return (
    <Link href={`/activity/${activity.id}`} asChild>
      <TouchableOpacity activeOpacity={0.8} className="bg-white rounded-lg shadow-sm mx-4 my-2 overflow-hidden">
        <View className="p-4">
          <View className="flex-row items-center mb-2">
            <MaterialIcons
              name={categoryIcons[activity.category] || 'category'}
              size={20}
              color="#3b82f6"
              className="mr-2"
            />
            <Text className="text-sm font-medium text-gray-500">
              {activity.category}
            </Text>
          </View>

          <Text className="text-lg font-bold text-gray-900 mb-1">
            {activity.title}
          </Text>

          <View className="flex-row items-center mb-2">
            <MaterialIcons name="access-time" size={16} color="#6b7280" className="mr-1" />
            <Text className="text-sm text-gray-600">
              {formatTime(activity.startTime)}
            </Text>
            {distance && (
              <>
                <Text className="mx-2 text-gray-400">•</Text>
                <MaterialIcons name="location-on" size={16} color="#6b7280" className="mr-1" />
                <Text className="text-sm text-gray-600">
                  {distance.toFixed(1)} mi
                </Text>
              </>
            )}
          </View>

          {activity.description && (
            <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
              {activity.description}
            </Text>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name="people" size={16} color="#6b7280" className="mr-1" />
              <Text className="text-sm text-gray-600">
                {rsvpCount} {rsvpCount === 1 ? 'person' : 'people'} going
              </Text>
            </View>

            <View className="flex-row">
              {userStatus ? (
                <TouchableOpacity
                  onPress={() => handleRSVP('cancelled')}
                  disabled={loading}
                  className="px-3 py-1.5 bg-red-500 rounded-full"
                >
                  <Text className="text-white text-sm font-medium">Cancel</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => handleRSVP('interested')}
                    disabled={loading}
                    className="px-3 py-1.5 bg-gray-200 rounded-full mr-2"
                  >
                    <Text className="text-gray-700 text-sm font-medium">Interested</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRSVP('going')}
                    disabled={loading}
                    className="px-3 py-1.5 bg-blue-500 rounded-full"
                  >
                    <Text className="text-white text-sm font-medium">Going</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
