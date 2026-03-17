import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as SQLite from 'expo-sqlite';

// Initialize database
const db = SQLite.openDatabaseSync('hobbyhub.db');

// Create tables if they don't exist
db.execSync(`
  CREATE TABLE IF NOT EXISTS hangouts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    hobby TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    startTime TEXT NOT NULL,
    maxAttendees INTEGER DEFAULT 6,
    description TEXT,
    hostId TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trustScore INTEGER DEFAULT 100,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS attendees (
    hangoutId TEXT,
    userId TEXT,
    status TEXT DEFAULT 'joined', -- joined, left
    PRIMARY KEY (hangoutId, userId)
  );
`);

interface Hangout {
  id: string;
  title: string;
  hobby: string;
  latitude: number;
  longitude: number;
  startTime: string;
  maxAttendees: number;
  description: string;
  hostId: string;
}

interface User {
  id: string;
  name: string;
  trustScore: number;
  avatar: string;
}

interface Attendee extends User {
  status: string;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function HangoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [hangout, setHangout] = useState<Hangout | null>(null);
  const [host, setHost] = useState<User | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState('current_user'); // In a real app, this would come from auth context

  useEffect(() => {
    loadHangoutDetails();
  }, [id]);

  const loadHangoutDetails = async () => {
    try {
      // Fetch hangout details
      const hangoutResult = await db.getFirstAsync<Hangout>(
        'SELECT * FROM hangouts WHERE id = ?',
        [id]
      );
      
      if (!hangoutResult) {
        Alert.alert('Error', 'Hangout not found');
        router.back();
        return;
      }
      
      setHangout(hangoutResult);
      
      // Fetch host details
      const hostResult = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ?',
        [hangoutResult.hostId]
      );
      
      if (hostResult) {
        setHost(hostResult);
      }
      
      // Fetch attendees
      const attendeesResult = await db.getAllAsync<Attendee>(
        `SELECT u.*, a.status 
         FROM attendees a 
         JOIN users u ON a.userId = u.id 
         WHERE a.hangoutId = ? AND a.status = 'joined'`,
        [id]
      );
      
      setAttendees(attendeesResult);
      
      // Check if current user is joined
      const currentUserAttendance = await db.getFirstAsync(
        'SELECT * FROM attendees WHERE hangoutId = ? AND userId = ? AND status = "joined"',
        [id, currentUserId]
      );
      
      setIsJoined(!!currentUserAttendance);
    } catch (error) {
      console.error('Error loading hangout details:', error);
      Alert.alert('Error', 'Failed to load hangout details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHangout = async () => {
    if (!hangout) return;
    
    // Check if already joined
    if (isJoined) {
      Alert.alert('Already Joined', 'You have already joined this hangout');
      return;
    }
    
    // Check capacity
    if (attendees.length >= hangout.maxAttendees) {
      Alert.alert('Capacity Reached', 'This hangout is at maximum capacity');
      return;
    }
    
    try {
      // Insert attendee record
      await db.runAsync(
        'INSERT INTO attendees (hangoutId, userId, status) VALUES (?, ?, ?)',
        [id, currentUserId, 'joined']
      );
      
      // Update state
      setIsJoined(true);
      
      // Reload attendees
      const attendeesResult = await db.getAllAsync<Attendee>(
        `SELECT u.*, a.status 
         FROM attendees a 
         JOIN users u ON a.userId = u.id 
         WHERE a.hangoutId = ? AND a.status = 'joined'`,
        [id]
      );
      
      setAttendees(attendeesResult);
      
      Alert.alert('Success', 'You have joined the hangout!');
    } catch (error) {
      console.error('Error joining hangout:', error);
      Alert.alert('Error', 'Failed to join hangout. Please try again.');
    }
  };

  const handleLeaveHangout = async () => {
    if (!hangout) return;
    
    try {
      // Remove attendee record
      await db.runAsync(
        'DELETE FROM attendees WHERE hangoutId = ? AND userId = ?',
        [id, currentUserId]
      );
      
      // Update state
      setIsJoined(false);
      
      // Reload attendees
      const attendeesResult = await db.getAllAsync<Attendee>(
        `SELECT u.*, a.status 
         FROM attendees a 
         JOIN users u ON a.userId = u.id 
         WHERE a.hangoutId = ? AND a.status = 'joined'`,
        [id]
      );
      
      setAttendees(attendeesResult);
      
      Alert.alert('Success', 'You have left the hangout');
    } catch (error) {
      console.error('Error leaving hangout:', error);
      Alert.alert('Error', 'Failed to leave hangout. Please try again.');
    }
  };

  if (loading || !hangout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading hangout details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Format start time
  const formattedStartTime = new Date(hangout.startTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              latitude: hangout.latitude,
              longitude: hangout.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
          >
            <Marker
              coordinate={{
                latitude: hangout.latitude,
                longitude: hangout.longitude,
              }}
              title={hangout.title}
              description={`Hobby: ${hangout.hobby}`}
            />
          </MapView>
        </View>

        {/* Title and Hobby */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{hangout.title}</Text>
          <View style={styles.hobbyTag}>
            <Text style={styles.hobbyText}>{hangout.hobby}</Text>
          </View>
        </View>

        {/* Time and Capacity */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Time:</Text>
            <Text style={styles.infoValue}>{formattedStartTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Capacity:</Text>
            <Text style={styles.infoValue}>
              {attendees.length}/{hangout.maxAttendees} attendees
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {hangout.description || 'No description provided.'}
          </Text>
        </View>

        {/* Host Information */}
        {host && (
          <View style={styles.hostSection}>
            <Text style={styles.sectionTitle}>Host</Text>
            <View style={styles.hostInfo}>
              <Image 
                source={{ uri: host.avatar || 'https://placehold.co/50x50' }} 
                style={styles.hostAvatar} 
              />
              <View style={styles.hostDetails}>
                <Text style={styles.hostName}>{host.name}</Text>
                <View style={styles.trustScoreContainer}>
                  <Text style={styles.trustScoreLabel}>Trust Score:</Text>
                  <View style={styles.trustScoreBar}>
                    <View 
                      style={[
                        styles.trustScoreFill,
                        { width: `${host.trustScore}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.trustScoreValue}>{host.trustScore}/100</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Attendees List */}
        <View style={styles.attendeesSection}>
          <Text style={styles.sectionTitle}>Attendees ({attendees.length})</Text>
          <View style={styles.attendeesGrid}>
            {attendees.map((attendee, index) => (
              <View key={`${attendee.id}-${index}`} style={styles.attendeeItem}>
                <Image 
                  source={{ uri: attendee.avatar || 'https://placehold.co/40x40' }} 
                  style={styles.attendeeAvatar} 
                />
                <Text style={styles.attendeeName} numberOfLines={1}>
                  {attendee.name.split(' ')[0]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Join/Leave Button */}
        <View style={styles.buttonContainer}>
          {isJoined ? (
            <TouchableOpacity 
              style={[styles.leaveButton, styles.actionButton]}
              onPress={handleLeaveHangout}
            >
              <Text style={styles.leaveButtonText}>Leave Hangout</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.joinButton, 
                styles.actionButton,
                attendees.length >= hangout.maxAttendees && styles.disabledButton
              ]}
              onPress={handleJoinHangout}
              disabled={attendees.length >= hangout.maxAttendees}
            >
              <Text style={styles.joinButtonText}>
                {attendees.length >= hangout.maxAttendees 
                  ? 'Hangout Full' 
                  : 'Join Hangout'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  content: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerSection: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  hobbyTag: {
    backgroundColor: '#E8EAF6',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  hobbyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3F51B5',
  },
  infoSection: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descriptionSection: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  hostSection: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  trustScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  trustScoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 8,
  },
  trustScoreFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  trustScoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'right',
  },
  attendeesSection: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  attendeesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  attendeeItem: {
    alignItems: 'center',
    width: 60,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  attendeeName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
  buttonContainer: {
    paddingHorizontal: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#6200EE',
  },
  leaveButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
