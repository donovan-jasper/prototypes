import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemoryStore } from '../../store/memoryStore';
import { Space } from '../../lib/types';
import { createSpace, getSpacesForUser, addMemberToSpace } from '../../lib/db';

export default function SharedSpacesScreen() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceMembers, setNewSpaceMembers] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [joinSpaceId, setJoinSpaceId] = useState('');
  const router = useRouter();
  const { userId, fetchSpaces } = useMemoryStore();

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const userSpaces = await getSpacesForUser(userId);
      setSpaces(userSpaces);
    } catch (error) {
      Alert.alert('Error', 'Failed to load spaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) {
      Alert.alert('Error', 'Please enter a space name');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const members = newSpaceMembers.split(',').map(email => email.trim()).filter(email => email);
      const space = await createSpace(newSpaceName, userId, members);
      setSpaces([...spaces, space]);
      setNewSpaceName('');
      setNewSpaceMembers('');
      setIsCreating(false);
      Alert.alert('Success', 'Space created successfully');
      await fetchSpaces();
    } catch (error) {
      Alert.alert('Error', 'Failed to create space');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSpace = async () => {
    if (!joinSpaceId.trim()) {
      Alert.alert('Error', 'Please enter a space ID');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      await addMemberToSpace(joinSpaceId, userId);
      Alert.alert('Success', 'Joined space successfully');
      setIsJoining(false);
      setJoinSpaceId('');
      await loadSpaces();
    } catch (error) {
      Alert.alert('Error', 'Failed to join space');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpaceItem = ({ item }: { item: Space }) => (
    <TouchableOpacity
      style={styles.spaceItem}
      onPress={() => router.push(`/space/${item.id}`)}
    >
      <Text style={styles.spaceName}>{item.name}</Text>
      <Text style={styles.spaceMembers}>{item.members.length} members</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading spaces...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Shared Spaces</Text>

      {isCreating ? (
        <View style={styles.createForm}>
          <TextInput
            style={styles.input}
            placeholder="Space name"
            value={newSpaceName}
            onChangeText={setNewSpaceName}
          />
          <TextInput
            style={styles.input}
            placeholder="Member emails (comma separated)"
            value={newSpaceMembers}
            onChangeText={setNewSpaceMembers}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsCreating(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreateSpace}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isJoining ? (
        <View style={styles.createForm}>
          <TextInput
            style={styles.input}
            placeholder="Space ID"
            value={joinSpaceId}
            onChangeText={setJoinSpaceId}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsJoining(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.joinButton]}
              onPress={handleJoinSpace}
            >
              <Text style={styles.buttonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setIsCreating(true)}
          >
            <Text style={styles.buttonText}>Create Space</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setIsJoining(true)}
          >
            <Text style={styles.buttonText}>Join Space</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Your Spaces</Text>

      {spaces.length === 0 ? (
        <Text style={styles.emptyText}>No spaces yet. Create or join one!</Text>
      ) : (
        <FlatList
          data={spaces}
          renderItem={renderSpaceItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
    color: '#444',
  },
  createForm: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  joinButton: {
    backgroundColor: '#2196F3',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  actionButtons: {
    marginBottom: 24,
  },
  spaceItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  spaceMembers: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
