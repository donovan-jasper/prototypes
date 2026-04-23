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
        <>
          <Text style={styles.sectionTitle}>Your Spaces</Text>
          <FlatList
            data={spaces}
            renderItem={({ item }) => <SpaceCard space={item} />}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You haven't created or joined any spaces yet.</Text>
          <Text style={styles.emptySubtext}>Create a space to share memories with others.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2c3e50',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#3498db',
  },
  joinButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  createForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
});
