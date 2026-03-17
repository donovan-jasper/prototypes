import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { getActivityById, updateRSVP, getRSVPCount, getUserRSVPStatus } from '../../lib/activities';
import { getOrganizerInfo, getActivityAttendees } from '../../lib/users';
import { CATEGORIES } from '../../constants/Categories';

interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  startTime: string;
  organizerId: number;
  maxAttendees: number | null;
  createdAt: string;
}

interface Organizer {
  id: number;
  name: string;
  eventsHosted: number;
}

interface Attendee {
  id: number;
  name: string;
  status: 'going' | 'interested';
}

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [userRSVPStatus, setUserRSVPStatus] = useState<'going' | 'interested' | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadActivityData = async () => {
    try {
      const activityData = await getActivityById(Number(id));
      if (!activityData) {
        Alert.alert('Error', 'Activity not found');
        router.back();
        return;
      }

      const organizerData = await getOrganizerInfo(activityData.organizerId);
      const attendeesData = await getActivityAttendees(Number(id));
      const count = await getRSVPCount(Number(id));
      const status = await getUserRSVPStatus(Number(id), 1); // Mock user ID

      setActivity(activityData);
      setOrganizer(organizerData);
      setAttendees(attendeesData);
      setAttendeeCount(count);
      setUserRSVPStatus(status);
    } catch (error) {
      console.error('Failed to load activity:', error);
      Alert.alert('Error', 'Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivityData();
  }, [id]);

  const handleRSVP = async (status: 'going' | 'interested' | 'cancel') => {
    if (updating) return;

    setUpdating(true);
    try {
      await updateRSVP(Number(id), 1, status === 'cancel' ? 'cancelled' : status);
      
      // Refresh data
      const count = await getRSVPCount(Number(id));
      const newStatus = await getUserRSVPStatus(Number(id), 1);
      const attendeesData = await getActivityAttendees(Number(id));
      
      setAttendeeCount(count);
      setUserRSVPStatus(newStatus);
      setAttendees(attendeesData);
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      Alert.alert('Error', 'Failed to update RSVP');
    } finally {
      setUpdating(false);
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Activity',
      'Why are you reporting this activity?',
      [
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Inappropriate', onPress: () => submitReport('inappropriate') },
        { text: 'Safety Concern', onPress: () => submitReport('safety') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitReport = (reason: string) => {
    // Mock report submission
    Alert.alert('Thank you', 'Your report has been submitted and will be reviewed.');
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!activity || !organizer) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-lg text-gray-600">Activity not found</Text>
      </View>
    );
  }

  const category = CATEGORIES.find(c => c.id === activity.category);
  const isNewOrganizer = organizer.eventsHosted < 3;
  const isFull = activity.maxAttendees !== null && attendeeCount >= activity.maxAttendees;

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Map */}
        <MapView
          style={{ width: '100%', height: 250 }}
          initialRegion={{
            latitude: activity.latitude,
            longitude: activity.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: activity.latitude,
              longitude: activity.longitude,
            }}
            title={activity.title}
          />
        </MapView>

        <View className="p-6">
          {/* Category Badge */}
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 text-sm font-medium">
                {category?.icon} {category?.name}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {activity.title}
          </Text>

          {/* Time */}
          <View className="flex-row items-center mb-4">
            <Text className="text-gray-600">
              🕐 {new Date(activity.startTime).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-4">
            <Text className="text-gray-600">
              📍 {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
            </Text>
          </View>

          {/* Description */}
          {activity.description && (
            <View className="mb-6">
              <Text className="text-base text-gray-700 leading-6">
                {activity.description}
              </Text>
            </View>
          )}

          {/* Organizer Info */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Organized by
            </Text>
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
                <Text className="text-white font-bold">
                  {organizer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {organizer.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  {organizer.eventsHosted} events hosted
                </Text>
              </View>
              {isNewOrganizer && (
                <View className="bg-yellow-100 px-2 py-1 rounded">
                  <Text className="text-yellow-800 text-xs font-medium">
                    New Organizer
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Attendee Count */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Attendees ({attendeeCount}
              {activity.maxAttendees !== null && `/${activity.maxAttendees}`})
            </Text>
            
            {attendees.length > 0 ? (
              <View>
                {attendees.map((attendee) => (
                  <View key={attendee.id} className="flex-row items-center mb-3">
                    <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center mr-3">
                      <Text className="text-white text-sm font-bold">
                        {attendee.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-900">{attendee.name}</Text>
                    </View>
                    {attendee.status === 'interested' && (
                      <View className="bg-gray-200 px-2 py-1 rounded">
                        <Text className="text-gray-700 text-xs">Interested</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-gray-500">
                Be the first to RSVP!
              </Text>
            )}
          </View>

          {/* RSVP Buttons */}
          <View className="mb-4">
            {userRSVPStatus === null ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleRSVP('going')}
                  disabled={updating || isFull}
                  className={`flex-1 rounded-lg py-4 items-center ${
                    isFull ? 'bg-gray-300' : 'bg-blue-500'
                  }`}
                >
                  {updating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      {isFull ? 'Full' : "I'm Going"}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRSVP('interested')}
                  disabled={updating}
                  className="flex-1 border-2 border-blue-500 rounded-lg py-4 items-center"
                >
                  {updating ? (
                    <ActivityIndicator color="#3b82f6" />
                  ) : (
                    <Text className="text-blue-500 text-base font-semibold">
                      Interested
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                  <Text className="text-green-800 text-center font-medium">
                    ✓ You're {userRSVPStatus === 'going' ? 'going' : 'interested'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRSVP('cancel')}
                  disabled={updating}
                  className="border border-red-500 rounded-lg py-3 items-center"
                >
                  {updating ? (
                    <ActivityIndicator color="#ef4444" />
                  ) : (
                    <Text className="text-red-500 text-base font-medium">
                      Cancel RSVP
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Report Button */}
          <TouchableOpacity
            onPress={handleReport}
            className="items-center py-3"
          >
            <Text className="text-gray-500 text-sm">
              🚩 Report this activity
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
