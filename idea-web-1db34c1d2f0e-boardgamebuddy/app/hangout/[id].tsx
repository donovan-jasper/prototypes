import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
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
    description TEXT
  );
  
  CREATE TABLE IF NOT EXISTS attendees (
    hangout_id TEXT,
    user_id TEXT,
    PRIMARY KEY (hangout_id, user_id),
    FOREIGN KEY (hangout_id) REFERENCES hangouts(id)
  );
  
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    trust_score INTEGER DEFAULT 100
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
  hostName: string;
  hostTrustScore: number;
  attendees: Array<{
    id: string;
    name: string;
    trustScore: number;
  }>;
}

export default function HangoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hangout, setHangout] = useState<Hangout | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch hangout data from database
  useEffect(() => {
    fetchHangoutDetails();
  }, [id]);

  const fetchHangoutDetails = async () => {
    try {
      // Get hangout details
      const hangoutResult = await db.getFirstAsync<any>(
        `SELECT h.*, u.name as hostName, u.trust_score as hostTrustScore 
         FROM hangouts h 
         LEFT JOIN users u ON h.hostId = u.id 
         WHERE h.id = ?`,
        [id]
      );

      if (!hangoutResult) {
        Alert.alert('Error', 'Hangout not found');
        router.back();
        return;
      }

      // Get attendees
      const attendeesResult = await db.getAllAsync<any>(
        `SELECT u.id, u.name, u.trust_score as trustScore 
         FROM attendees a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.hangout_id = ?`,
        [id]
      );

      // Check if current user is joined (for demo, we'll use a fixed user ID)
      const currentUserIsJoined = await db.getFirstAsync<any>(
        `SELECT 1 FROM attendees WHERE hangout_id = ? AND user_id = ?`,
        [id, 'current_user']
      );

      const hangoutData: Hangout = {
        id: hangoutResult.id,
        title: hangoutResult.title,
        hobby: hangoutResult.hobby,
        latitude: hangoutResult.latitude,
        longitude: hangoutResult.longitude,
        startTime: hangoutResult.startTime,
        maxAttendees: hangoutResult.maxAttendees,
        description: hangoutResult.description || 'No description provided.',
        hostId: hangoutResult.hostId,
        hostName: hangoutResult.hostName || 'Unknown Host',
        hostTrustScore: hangoutResult.hostTrustScore || 100,
        attendees: attendeesResult.map(att => ({
          id: att.id,
          name: att.name,
          trustScore: att.trustScore || 100
        }))
      };

      setHangout(hangoutData);
      setIsJoined(!!currentUserIsJoined);
    } catch (error) {
      console.error('Error fetching hangout details:', error);
      Alert.alert('Error', 'Failed to load hangout details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!hangout) return;

    try {
      if (isJoined) {
        // Leave hangout
        await db.runAsync(
          'DELETE FROM attendees WHERE hangout_id = ? AND user_id = ?',
          [hangout.id, 'current_user']
        );
        setIsJoined(false);
        Alert.alert('Success', 'You have left the hangout.');
      } else {
        // Join hangout
        if (hangout.attendees.length >= hangout.maxAttendees) {
          Alert.alert('Sorry', 'This hangout is at maximum capacity.');
          return;
        }

        await db.runAsync(
          'INSERT INTO attendees (hangout_id, user_id) VALUES (?, ?)',
          [hangout.id, 'current_user']
        );
        setIsJoined(true);
        Alert.alert('Success', 'You have joined the hangout!');
      }

      // Refresh the hangout data
      fetchHangoutDetails();
    } catch (error) {
      console.error('Error joining/leaving hangout:', error);
      Alert.alert('Error', 'Failed to update your attendance. Please try again.');
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{hangout.title}</Text>
          <View style={styles.hobbyTag}>
            <Text style={styles.hobbyText}>{hangout.hobby}</Text>
          </View>
        </View>

        {/* Time and Location */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            {new Date(hangout.startTime).toLocaleString()}
          </Text>
          <Text style={styles.infoText}>
            {hangout.attendees.length}/{hangout.maxAttendees} attending
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: hangout.latitude,
              longitude: hangout.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: hangout.latitude,
                longitude: hangout.longitude,
              }}
              title={hangout.title}
              description={`Hosted by ${hangout.hostName}`}
            />
          </MapView>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{hangout.description}</Text>
        </View>

        {/* Host Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Host</Text>
          <View style={styles.hostContainer}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: 'https://placehold.co/50' }} style={styles.avatar} />
            </View>
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{hangout.hostName}</Text>
              <View style={styles.trustContainer}>
                <Text style={styles.trustText}>Trust Score: {hangout.hostTrustScore}/100</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Attendees List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendees ({hangout.attendees.length})</Text>
          <View style={styles.attendeesContainer}>
            {hangout.attendees.map((attendee, index) => (
              <View key={attendee.id} style={styles.attendeeItem}>
                <Image source={{ uri: 'https://placehold.co/40' }} style={styles.attendeeAvatar} />
                <View style={styles.attendeeInfo}>
                  <Text style={styles.attendeeName}>{attendee.name}</Text>
                  <Text style={styles.attendeeTrust}>Trust: {attendee.trustScore}/100</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Chat Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat</Text>
          <View style={styles.chatPreview}>
            <Text style={styles.chatText}>Chat coming soon...</Text>
          </View>
        </View>

        {/* Join/Leave Button */}
        <TouchableOpacity 
          style={[styles.joinButton, isJoined && styles.leaveButton]} 
          onPress={handleJoinLeave}
        >
          <Text style={styles.joinButtonText}>
            {isJoined ? 'Leave Hangout' : 'Join Hangout'}
          </Text>
        </TouchableOpacity>
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
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 15,
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
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  trustContainer: {
    marginTop: 4,
  },
  trustText: {
    fontSize: 14,
    color: '#666',
  },
  attendeesContainer: {
    flexDirection: 'column',
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  attendeeTrust: {
    fontSize: 14,
    color: '#666',
  },
  chatPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
  },
  chatText: {
    fontSize: 16,
    color: '#888',
  },
  joinButton: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  leaveButton: {
    backgroundColor: '#F44336',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
