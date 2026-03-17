import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
    maxAttendees INTEGER DEFAULT 6
  );
`);

// Helper to format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = date.getTime() - now.getTime(); // Difference in milliseconds

  const minutes = Math.round(diff / (1000 * 60));
  const hours = Math.round(diff / (1000 * 60 * 60));
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (minutes < 0) return 'Ended';
  if (minutes < 60) return `in ${minutes} min`;
  if (hours < 24) return `in ${hours} hr${hours > 1 ? 's' : ''}`;
  if (days < 7) return `in ${days} day${days > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
};

// Helper to calculate distance between two points (in miles)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in miles
};

interface Hangout {
  id: string;
  title: string;
  hobby: string;
  distance: number; // in miles
  startTime: string;
  attendees: number;
  maxAttendees: number;
}

export default function ProximityFeedScreen() {
  const router = useRouter();
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [loading, setLoading] = useState(true);

  // Load hangouts from database
  useEffect(() => {
    loadHangouts();
  }, []);

  const loadHangouts = async () => {
    try {
      // For demo purposes, we'll use a fixed user location (NYC)
      const userLat = 40.7128;
      const userLng = -74.0060;

      // Get all hangouts from database
      const result = await db.getAllAsync<{id: string, title: string, hobby: string, latitude: number, longitude: number, startTime: string, maxAttendees: number}>('SELECT * FROM hangouts');
      
      // Calculate distances and add to hangouts array
      const hangoutsWithDistance = result.map(row => {
        const distance = calculateDistance(userLat, userLng, row.latitude, row.longitude);
        
        // For demo purposes, we'll simulate attendees count
        const attendees = Math.floor(Math.random() * row.maxAttendees) + 1;
        
        return {
          id: row.id,
          title: row.title,
          hobby: row.hobby,
          distance: distance,
          startTime: row.startTime,
          attendees: attendees,
          maxAttendees: row.maxAttendees,
        };
      });

      // Filter to only show hangouts within 5 miles
      const filteredHangouts = hangoutsWithDistance.filter(h => h.distance <= 5);

      // Sort by distance
      filteredHangouts.sort((a, b) => a.distance - b.distance);

      setHangouts(filteredHangouts);
    } catch (error) {
      console.error('Error loading hangouts:', error);
      Alert.alert('Error', 'Failed to load hangouts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHangoutCard = ({ item }: { item: Hangout }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => router.push(`/hangout/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.hobbyTag}>
          <Text style={styles.hobbyText}>{item.hobby}</Text>
        </View>
      </View>
      <Text style={styles.cardDetail}>{formatTime(item.startTime)} • {item.distance.toFixed(1)} mi away</Text>
      <Text style={styles.cardDetail}>{item.attendees}/{item.maxAttendees} attending</Text>
      <TouchableOpacity 
        style={styles.joinButton}
        onPress={() => {
          // In a real app, this would handle joining logic
          Alert.alert('Join Hangout', `Would you like to join "${item.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Join', onPress: () => console.log(`Joined hangout ${item.id}`) }
          ]);
        }}
      >
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Proximity Feed</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading hangouts...</Text>
        </View>
      ) : hangouts.length > 0 ? (
        <FlatList
          data={hangouts}
          renderItem={renderHangoutCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadHangouts}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Welcome to HobbyHub! Your feed will appear here.
          </Text>
          <Text style={styles.emptyStateSubText}>
            No hangouts nearby yet. Be the first to create one!
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/create')}
          >
            <Text style={styles.createButtonText}>Create First Hangout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light grey background
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
    marginRight: 10,
  },
  hobbyTag: {
    backgroundColor: '#E8EAF6', // Light purple
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hobbyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3F51B5', // Darker purple
  },
  cardDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  joinButton: {
    backgroundColor: '#6200EE', // Primary purple
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  emptyStateSubText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#6200EE',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
