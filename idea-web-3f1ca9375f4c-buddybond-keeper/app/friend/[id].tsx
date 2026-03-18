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
import { getFriendById, getInteractionsByFriend, deleteFriend, calculateHealthScore, initDatabase } from '@/lib/database';
import { Friend, Interaction, HealthStatus } from '@/lib/types';
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
    router.push(`/log-interaction?friendId=${friendId}`);
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

  const getHealthColor = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'neglected':
        return '#F44336';
    }
  };

  const getHealthLabel = (status: HealthStatus) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Needs Attention';
      case 'neglected':
        return 'Neglected';
    }
  };

  const getInteractionIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'call': return '📞';
      case 'text': return '💬';
      case 'video': return '📹';
      case 'in-person': return '🤝';
      case 'other': return '✨';
    }
  };

  const getInteractionLabel = (type: Interaction['type']) => {
    switch (type) {
      case 'call': return 'Call';
      case 'text': return 'Text';
      case 'video': return 'Video';
      case 'in-person': return 'In-person';
      case 'other': return 'Other';
    }
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
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
          
          <View style={[styles.healthBadge, { backgroundColor: getHealthColor(healthStatus) }]}>
            <Text style={styles.healthBadgeText}>{getHealthLabel(healthStatus)}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          {friend.birthday && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Birthday</Text>
              <Text style={styles.infoValue}>{friend.birthday}</Text>
            </View>
          )}
          
          {friend.interests && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Interests</Text>
              <Text style={styles.infoValue}>{friend.interests}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reminder Frequency</Text>
            <Text style={styles.infoValue}>Every {friend.reminderFrequency} days</Text>
          </View>
          
          {friend.lastContacted && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Contacted</Text>
              <Text style={styles.infoValue}>
                {format(new Date(friend.lastContacted), 'MMM d, yyyy')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interaction Timeline</Text>
          
          {interactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No interactions yet</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {interactions.map((interaction) => (
                <View key={interaction.id} style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <Text style={styles.timelineIconText}>{getInteractionIcon(interaction.type)}</Text>
                  </View>
                  
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineType}>{getInteractionLabel(interaction.type)}</Text>
                      <Text style={styles.timelineDate}>
                        {format(new Date(interaction.date), 'MMM d, yyyy')}
                      </Text>
                    </View>
                    
                    {interaction.notes && (
                      <Text style={styles.timelineNotes}>{interaction.notes}</Text>
                    )}
                    
                    {interaction.photoUri && (
                      <Image source={{ uri: interaction.photoUri }} style={styles.timelinePhoto} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Friend</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleLogInteraction}>
        <Text style={styles.fabText}>+ Log</Text>
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
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
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
  },
  healthBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
  timeline: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIconText: {
    fontSize: 20,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  timelineDate: {
    fontSize: 14,
    color: '#757575',
  },
  timelineNotes: {
    fontSize: 14,
    color: '#424242',
    marginTop: 4,
    lineHeight: 20,
  },
  timelinePhoto: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  deleteButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
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
    fontSize: 16,
    fontWeight: '600',
  },
});
