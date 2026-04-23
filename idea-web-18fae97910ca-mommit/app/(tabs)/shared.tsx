import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemoryStore } from '../../store/memoryStore';
import { Space } from '../../lib/types';
import { createSpace, getSpacesForUser, addMemberToSpace } from '../../lib/db';

export default function SharedSpacesScreen() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceMembers, setNewSpaceMembers] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      // In a real app, you would have a way to find the space ID by name
      // For this example, we'll just use a mock ID
      const spaceId = Date.now().toString();
      await addMemberToSpace(spaceId, userId);
      Alert.alert('Success', 'Joined space successfully');
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
    <View style={styles.container}>
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
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={() => setIsCreating(true)}
          >
            <Text style={styles.buttonText}>Create New Space</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.joinButton]}
            onPress={() => {
              setNewSpaceName('');
              setIsCreating(true);
            }}
          >
            <Text style={styles.buttonText}>Join Space</Text>
          </TouchableOpacity>
        </View>
      )}

      {spaces.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No shared spaces yet</Text>
          <Text style={styles.emptySubtext}>Create or join a space to share memories with others</Text>
        </View>
      ) : (
        <FlatList
          data={spaces}
          renderItem={renderSpaceItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  createForm: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
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
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  joinButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  spaceItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  spaceMembers: {
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
