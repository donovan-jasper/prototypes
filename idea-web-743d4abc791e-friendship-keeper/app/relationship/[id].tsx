import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useRelationships } from '../../hooks/useRelationships';
import { useInteractions } from '../../hooks/useInteractions';
import { HealthIndicator } from '../../components/HealthIndicator';
import { InteractionTimeline } from '../../components/InteractionTimeline';
import { ConversationStarter } from '../../components/ConversationStarter';
import { ActivitySuggestion } from '../../components/ActivitySuggestion';
import { RelationshipWithHealth } from '../../types';

export default function RelationshipDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { relationships, deleteRelationship, updateRelationship } = useRelationships();
  const { interactions, logInteraction } = useInteractions(Number(id));
  const [relationship, setRelationship] = useState<RelationshipWithHealth | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const foundRelationship = relationships.find(r => r.id === Number(id));
    if (foundRelationship) {
      setRelationship(foundRelationship);
    }
  }, [relationships, id]);

  if (!relationship) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const getCategoryColor = () => {
    switch (relationship.category) {
      case 'Family':
        return '#E91E63';
      case 'Friends':
        return '#2196F3';
      case 'Professional':
        return '#9C27B0';
      case 'Acquaintance':
        return '#607D8B';
      default:
        return '#9E9E9E';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Relationship',
      `Are you sure you want to delete ${relationship.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRelationship(relationship.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete relationship');
            }
          },
        },
      ]
    );
  };

  const handleAddPhoneNumber = () => {
    router.push({
      pathname: '/relationship/add',
      params: { editMode: 'true', id: relationship.id.toString() }
    });
  };

  const handleCall = () => {
    if (relationship.phoneNumber) {
      Linking.openURL(`tel:${relationship.phoneNumber}`);
    } else {
      Alert.alert('No Phone Number', 'This relationship doesn\'t have a phone number. Add one to call directly.');
    }
  };

  const handleText = () => {
    if (relationship.phoneNumber) {
      Linking.openURL(`sms:${relationship.phoneNumber}`);
    } else {
      Alert.alert('No Phone Number', 'This relationship doesn\'t have a phone number. Add one to text directly.');
    }
  };

  const handleLogInteraction = () => {
    router.push({
      pathname: '/interaction/log',
      params: { relationshipId: relationship.id.toString() }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.name}>{relationship.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
            <Text style={styles.categoryText}>{relationship.category}</Text>
          </View>
        </View>

        <View style={styles.healthContainer}>
          <HealthIndicator score={relationship.health.score} size="large" />
          <Text style={styles.healthStatus}>{relationship.health.status}</Text>
        </View>

        <View style={styles.phoneContainer}>
          {relationship.phoneNumber ? (
            <>
              <Text style={styles.phoneLabel}>Phone Number:</Text>
              <Text style={styles.phoneNumber}>{relationship.phoneNumber}</Text>
            </>
          ) : (
            <TouchableOpacity
              style={styles.addPhoneButton}
              onPress={handleAddPhoneNumber}
            >
              <MaterialIcons name="add" size={16} color="#fff" />
              <Text style={styles.addPhoneText}>Add Phone Number</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MaterialIcons name="event" size={20} color="#666" />
          <Text style={styles.detailLabel}>Contact Frequency:</Text>
          <Text style={styles.detailValue}>{relationship.frequency}</Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="star" size={20} color="#FFD700" />
          <Text style={styles.detailLabel}>Importance:</Text>
          <Text style={styles.detailValue}>{'★'.repeat(relationship.importance)}{'☆'.repeat(5 - relationship.importance)}</Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialIcons name="history" size={20} color="#666" />
          <Text style={styles.detailLabel}>Last Contact:</Text>
          <Text style={styles.detailValue}>
            {relationship.health.daysSinceContact === 0
              ? 'Today'
              : `${relationship.health.daysSinceContact} days ago`}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, !relationship.phoneNumber && styles.disabledButton]}
          onPress={handleCall}
          disabled={!relationship.phoneNumber}
        >
          <MaterialIcons name="phone" size={24} color={relationship.phoneNumber ? "#4CAF50" : "#ccc"} />
          <Text style={[styles.actionText, !relationship.phoneNumber && styles.disabledText]}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, !relationship.phoneNumber && styles.disabledButton]}
          onPress={handleText}
          disabled={!relationship.phoneNumber}
        >
          <MaterialIcons name="message" size={24} color={relationship.phoneNumber ? "#2196F3" : "#ccc"} />
          <Text style={[styles.actionText, !relationship.phoneNumber && styles.disabledText]}>Text</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLogInteraction}
        >
          <MaterialIcons name="edit" size={24} color="#673AB7" />
          <Text style={styles.actionText}>Log Interaction</Text>
        </TouchableOpacity>
      </View>

      {interactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interaction History</Text>
          <InteractionTimeline interactions={interactions} />
        </View>
      )}

      {interactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversation Starter</Text>
          <ConversationStarter relationshipId={relationship.id} />
        </View>
      )}

      {isPremium && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Suggestions</Text>
          <ActivitySuggestion relationship={relationship} />
        </View>
      )}

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Relationship</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  healthStatus: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  phoneContainer: {
    marginTop: 10,
  },
  phoneLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  addPhoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  addPhoneText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  disabledText: {
    color: '#ccc',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  dangerZone: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
