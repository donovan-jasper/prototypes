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
  }, [event]);

  const handleJoinEvent = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please wait while we set up your account');
      return;
    }

    try {
      await joinEvent(event.id, userId);
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
  const participantCount = event.participants?.length || 0;

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
              <View style={[styles.avatar, styles.avatarMore, { marginLeft: -10 }]}>
                <Text style={styles.avatarText}>+{participantCount - 5}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: event.latitude,
            longitude: event.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={event.title}
          />
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              pinColor="blue"
              title="Your Location"
            />
          )}
        </MapView>
      </View>

      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      <TouchableOpacity style={styles.joinButton} onPress={handleJoinEvent}>
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.joinButtonText}>Quick Join</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  infoRow: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  participantsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantsCount: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
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
    borderColor: '#fff',
  },
  avatarMore: {
    backgroundColor: '#8E8E93',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mapSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  joinButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EventScreen;
