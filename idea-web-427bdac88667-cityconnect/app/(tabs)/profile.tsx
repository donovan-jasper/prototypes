import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { getUserById } from '../../lib/users';
import { getActivitiesNearby, Activity } from '../../lib/activities';
import { useLocation } from '../../hooks/useLocation';
import ActivityCard from '../../components/ActivityCard';
import { CATEGORIES } from '../../constants/Categories';

interface UserProfile {
  id: number;
  name: string;
  reliabilityScore: number;
  interests: string[];
}

export default function ProfileScreen() {
  const { location } = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hostingActivities, setHostingActivities] = useState<Activity[]>([]);
  const [attendingActivities, setAttendingActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'hosting' | 'attending'>('hosting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, [location]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const user = await getUserById(1);
      if (user) {
        setProfile({
          id: user.id,
          name: user.name,
          reliabilityScore: user.reliabilityScore,
          interests: user.interests ? user.interests.split(',') : [],
        });
      }

      // Load hosting activities (where organizerId = 1)
      if (location) {
        const allActivities = await getActivitiesNearby(
          location.coords.latitude,
          location.coords.longitude,
          50 // Large radius to get all user's activities
        );
        
        const hosting = allActivities.filter(activity => activity.organizerId === 1);
        setHostingActivities(hosting);
        
        // For attending, we'd need to query RSVPs - simplified for now
        // In a real app, you'd query activities where user has RSVPs
        setAttendingActivities([]);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-lg text-gray-600 text-center">
          Failed to load profile
        </Text>
      </View>
    );
  }

  const currentActivities = activeTab === 'hosting' ? hostingActivities : attendingActivities;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* User Info Card */}
      <View className="bg-white p-6 mb-4">
        <View className="items-center mb-4">
          <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-3">
            <Text className="text-3xl text-white font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {profile.name}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-lg text-gray-600 mr-2">
              Reliability: {Math.round(profile.reliabilityScore * 100)}%
            </Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-green-700">
                ✓ Verified Organizer
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* My Activities Section */}
      <View className="bg-white mb-4">
        <View className="px-6 pt-6 pb-2">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            My Activities
          </Text>
          
          {/* Tabs */}
          <View className="flex-row mb-4">
            <TouchableOpacity
              onPress={() => setActiveTab('hosting')}
              className={`flex-1 py-3 border-b-2 ${
                activeTab === 'hosting'
                  ? 'border-blue-500'
                  : 'border-gray-200'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'hosting'
                    ? 'text-blue-500'
                    : 'text-gray-500'
                }`}
              >
                Hosting ({hostingActivities.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('attending')}
              className={`flex-1 py-3 border-b-2 ${
                activeTab === 'attending'
                  ? 'border-blue-500'
                  : 'border-gray-200'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'attending'
                    ? 'text-blue-500'
                    : 'text-gray-500'
                }`}
              >
                Attending ({attendingActivities.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activities List */}
        {currentActivities.length === 0 ? (
          <View className="px-6 py-8">
            <Text className="text-center text-gray-500">
              {activeTab === 'hosting'
                ? 'You haven\'t hosted any activities yet'
                : 'You haven\'t joined any activities yet'}
            </Text>
          </View>
        ) : (
          <View>
            {currentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </View>
        )}
      </View>

      {/* Interests Section */}
      <View className="bg-white p-6 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">
            Interests
          </Text>
          <TouchableOpacity>
            <Text className="text-blue-500 font-semibold">Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row flex-wrap">
          {profile.interests.map((interestId) => {
            const category = CATEGORIES.find(cat => cat.id === interestId);
            if (!category) return null;
            
            return (
              <View
                key={interestId}
                className="bg-blue-100 px-4 py-2 rounded-full mr-2 mb-2"
              >
                <Text className="text-blue-700 font-medium">
                  {category.icon} {category.name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Premium Upgrade Card */}
      <View className="bg-gradient-to-br from-purple-500 to-blue-500 mx-4 mb-6 rounded-xl overflow-hidden">
        <View className="p-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-2">👑</Text>
            <Text className="text-2xl font-bold text-white">
              Go Premium
            </Text>
          </View>
          
          <Text className="text-white text-base mb-4 opacity-90">
            Unlock unlimited posts, extended radius, and more
          </Text>
          
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Text className="text-white mr-2">✓</Text>
              <Text className="text-white">Unlimited activity posts</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-white mr-2">✓</Text>
              <Text className="text-white">Up to 5-mile radius</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-white mr-2">✓</Text>
              <Text className="text-white">Custom activity alerts</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-white mr-2">✓</Text>
              <Text className="text-white">Ad-free experience</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-white mr-2">✓</Text>
              <Text className="text-white">Verified Organizer badge</Text>
            </View>
          </View>
          
          <TouchableOpacity className="bg-white rounded-lg py-4 items-center">
            <Text className="text-purple-600 font-bold text-lg">
              Upgrade for $4.99/month
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
