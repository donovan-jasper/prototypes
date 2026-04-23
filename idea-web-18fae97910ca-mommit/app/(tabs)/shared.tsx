import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemoryStore } from '../../store/memoryStore';
import { Space } from '../../lib/types';
import { createSpace, getSpacesForUser } from '../../lib/db';

export default function SharedSpacesScreen() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceMembers, setNewSpaceMembers] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { userId } = useMemoryStore();

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    if (userId) {
      const userSpaces = await getSpacesForUser(userId);
      setSpaces(userSpaces);
    }
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) {
      Alert.alert('Error', 'Please enter a space name');
      return;
    }

    try {
      const members = newSpaceMembers.split(',').map(email => email.trim()).filter(email => email);
      const space = await createSpace(newSpaceName, userId, members);
      setSpaces([...spaces, space]);
      setNewSpaceName('');
      setNewSpaceMembers('');
      setIsCreating(false);
      Alert.alert('Success', 'Space created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create space');
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
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsCreating(true)}
        >
          <Text style={styles.buttonText}>Create New Space</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={spaces}
        renderItem={renderSpaceItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
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
  button: {
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
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
});
