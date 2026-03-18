import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Friend, Interaction } from '@/lib/types';
import { getFriendById, getInteractionsByFriend, deleteFriend, calculateHealthScore, initDatabase } from '@/lib/database';
import InteractionTimeline from '@/components/InteractionTimeline';
import { format } from 'date-fns';

export default function FriendDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const friendId = params.id as string;

  const [friend, setFriend] = useState<Friend | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriendData = useCallback(async () => {
    try {
      const friendData = await getFriendById(friendId);
      if (!friendData) {
        Alert.alert('Error', 'Friend not found');
        router.back();
        return;
      }
      
      const interactionData = await getInteractionsByFriend(friendId);
      setFriend(friendData);
      setInteractions(interactionData);
    } catch (error) {
      console.error('Error loading friend data:', error);
      Alert.alert('Error', 'Failed to load friend data');
    } finally {
      setLoading(false);
    }
  }, [friendId, router]);

  useEffect(() => {
    initDatabase().then(() => {
      loadFriendData();
    });
  }, [loadFriendData]);

  useFocusEffect(
    useCallback(() => {
      loadFriendData();
    }, [loadFriendData])
  );

  const handleLogInteraction = () => {
    router.push({
      pathname: '/log-interaction',
      params: { friendId },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Friend',
      `Are you sure you want to delete ${friend?.name}? This will also delete all interactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFriend(friendId);
              router.back();
            } catch (error) {
              console.error('Error deleting friend:', error);
              Alert.alert('Error', 'Failed to delete friend');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (!friend) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Friend not found</Text>
      </View>
    );
  }

  const healthStatus = calculateHealthScore(friend);
  const getHealthColor = () => {
    switch (healthStatus) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'neglected':
        return '#F44336';
    }
  };

  const getHealthLabel = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Needs Attention';
      case 'neglected':
        return 'Neglected';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          {friend.photoUri ? (
            <Image source={{ uri: friend.photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.photoPlaceholderText}>
                {friend.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          
          <Text style={styles.name}>{friend.name}</Text>
          
          <View style={[styles.healthBadge, { backgroundColor: getHealthColor() }]}>
            <Text style={styles.healthBadgeText}>{getHealthLabel()}</Text>
          </View>

          {friend.birthday && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Birthday:</Text>
              <Text style={styles.infoValue}>
                {format(new Date(friend.birthday), 'MMMM d, yyyy')}
              </Text>
            </View>
          )}

          {friend.interests && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Interests:</Text>
              <Text style={styles.infoValue}>{friend.interests}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Check-in frequency:</Text>
            <Text style={styles.infoValue}>Every {friend.reminderFrequency} days</Text>
          </View>

          {friend.lastContacted && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last contacted:</Text>
              <Text style={styles.infoValue}>
                {format(new Date(friend.lastContacted), 'MMM d, yyyy')}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Friend</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Interaction History</Text>
          <InteractionTimeline interactions={interactions} />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleLogInteraction}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#757575',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  photoPlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#757575',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  healthBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  healthBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  timelineSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
});
