import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemoryStore } from '../../store/memoryStore';
import { Space } from '../../lib/types';
import { createSpace, getSpacesForUser, addMemberToSpace } from '../../lib/db';
import SpaceCard from '../../components/SpaceCard';

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
    <SpaceCard
      space={item}
      onPress={() => router.push(`/space/${item.id}`)}
    />
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

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.createButton]}
          onPress={() => setIsCreating(true)}
        >
          <Text style={styles.buttonText}>Create Space</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.joinButton]}
          onPress={() => setIsJoining(true)}
        >
          <Text style={styles.buttonText}>Join Space</Text>
        </TouchableOpacity>
      </View>

      {isCreating ? (
        <View style={styles.createForm}>
          <Text style={styles.formTitle}>Create New Space</Text>
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
          <Text style={styles.formTitle}>Join Space</Text>
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
      ) : null}

      {spaces.length > 0 ? (
        <FlatList
          data={spaces}
          renderItem={renderSpaceItem}
          keyExtractor={(item) => item.id}
          style={styles.spaceList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No shared spaces yet</Text>
          <Text style={styles.emptySubtext}>Create or join a space to share memories with others</Text>
        </View>
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
    marginBottom: 20,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
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
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createForm: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  spaceList: {
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
