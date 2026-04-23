import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { joinEvent } from '../utils/eventService';
import { useAuth } from '../hooks/useAuth';
import { calculateDistance } from '../utils/geohash';

const { width } = Dimensions.get('window');

const EventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const { userId } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [hasJoined, setHasJoined] = useState(false);
  const [participantCount, setParticipantCount] = useState(event.participants?.length || 0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);

        const distanceKm = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          event.latitude,
          event.longitude
        );
        setDistance(distanceKm);
      }
    })();

    // Check if user has already joined
    if (userId && event.participants) {
      setHasJoined(event.participants.includes(userId));
    }
  }, [event, userId]);

  const handleJoinEvent = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please wait while we set up your account');
      return;
    }

    try {
      await joinEvent(event.id, userId);
      setHasJoined(true);
      setParticipantCount(prev => prev + 1);
      Alert.alert('Success', 'You have successfully joined the event!');
      navigation.navigate('Chat', { event });
    } catch (error) {
      Alert.alert('Error', 'Failed to join event. Please try again.');
      console.error('Error joining event:', error);
    }
  };

  const toggleDistanceUnit = () => {
    setDistanceUnit(distanceUnit === 'km' ? 'mi' : 'km');
  };

  const formatDistance = () => {
    if (distance === null) return 'Calculating...';
    const value = distanceUnit === 'km' ? distance : distance * 0.621371;
    return `${value.toFixed(1)} ${distanceUnit}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventStatus = () => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 0) return { label: 'Past', color: '#8E8E93' };
    if (hoursDiff < 2) return { label: 'Happening Now', color: '#34C759' };
    if (hoursDiff < 24) return { label: 'Today', color: '#FF9500' };
    return { label: 'Upcoming', color: '#007AFF' };
  };

  const status = getEventStatus();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
        <Text style={styles.title}>{event.title}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          <Text style={styles.infoText}>{formatDate(event.date)}</Text>
        </View>

        <TouchableOpacity style={styles.infoItem} onPress={toggleDistanceUnit}>
          <Ionicons name="location-outline" size={20} color="#007AFF" />
          <Text style={styles.infoText}>{formatDistance()} away</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.participantsSection}>
        <View style={styles.participantsHeader}>
          <Ionicons name="people-outline" size={20} color="#007AFF" />
          <Text style={styles.participantsCount}>
            {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
          </Text>
        </View>

        {participantCount > 0 && (
          <View style={styles.avatarContainer}>
            {[...Array(Math.min(participantCount, 5))].map((_, index) => (
              <View key={index} style={[styles.avatar, { marginLeft: index > 0 ? -10 : 0 }]}>
                <Text style={styles.avatarText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
            ))}
            {participantCount > 5 && (
              <View style={[styles.avatar, styles.avatarMore]}>
                <Text style={styles.avatarText}>+{participantCount - 5}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>About this event</Text>
        <Text style={styles.descriptionText}>{event.description}</Text>
      </View>

      {!hasJoined && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoinEvent}
          disabled={hasJoined}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color="white" />
          <Text style={styles.joinButtonText}>Quick Join</Text>
        </TouchableOpacity>
      )}

      {hasJoined && (
        <View style={styles.joinedContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#34C759" />
          <Text style={styles.joinedText}>You're going to this event!</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: event.latitude,
            longitude: event.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={event.title}
          />
        </MapView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#8E8E93',
  },
  participantsSection: {
    marginBottom: 20,
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantsCount: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  avatarMore: {
    backgroundColor: '#8E8E93',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5F7E9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  joinedText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
});
