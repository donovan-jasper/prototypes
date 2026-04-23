import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemoryStore } from '../../store/memoryStore';
import { Memory, Space } from '../../lib/types';
import { getSpaceById, addMemberToSpace, removeMemberFromSpace, getMemoriesForSpace, createMemory } from '../../lib/db';
import MemoryCard from '../../components/MemoryCard';
import { parseNaturalLanguage } from '../../lib/ai';

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const router = useRouter();
  const { userId, addMemory } = useMemoryStore();

  useEffect(() => {
    if (id) {
      loadSpaceData();
    }
  }, [id]);

  const loadSpaceData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const spaceData = await getSpaceById(id);
      setSpace(spaceData);

      const spaceMemories = await getMemoriesForSpace(id);
      setMemories(spaceMemories);
    } catch (error) {
      Alert.alert('Error', 'Failed to load space data');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!id) return;

    setIsLoading(true);
    try {
      await addMemberToSpace(id, newMemberEmail);
      setSpace(prev => prev ? { ...prev, members: [...prev.members, newMemberEmail] } : null);
      setNewMemberEmail('');
      setIsAddingMember(false);
      Alert.alert('Success', 'Member added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (email: string) => {
    if (!id) return;

    setIsLoading(true);
    try {
      await removeMemberFromSpace(id, email);
      setSpace(prev => prev ? {
        ...prev,
        members: prev.members.filter(member => member !== email)
      } : null);
      Alert.alert('Success', 'Member removed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemoryText.trim()) {
      Alert.alert('Error', 'Please enter a memory description');
      return;
    }

    if (!userId || !id) return;

    setIsLoading(true);
    try {
      // Parse the natural language input
      const parsed = await parseNaturalLanguage(newMemoryText);

      // Create the memory in the database
      const memory = await createMemory(
        parsed.title,
        parsed.description,
        parsed.triggerType,
        parsed.triggerValue,
        userId
      );

      // Add to the space
      // In a real app, you would have a separate function to add memory to space
      // For this example, we'll just add it to our local state
      setMemories([memory, ...memories]);
      setNewMemoryText('');

      // Update the global state
      addMemory(memory);

      Alert.alert('Success', 'Memory added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add memory');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMemoryItem = ({ item }: { item: Memory }) => (
    <MemoryCard
      memory={item}
      onComplete={() => {
        // Handle complete action
      }}
      onSnooze={() => {
        // Handle snooze action
      }}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading space details...</Text>
      </View>
    );
  }

  if (!space) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Space not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{space.name}</Text>

      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Members ({space.members.length})</Text>

        {isAddingMember ? (
          <View style={styles.addMemberForm}>
            <TextInput
              style={styles.input}
              placeholder="Member email"
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsAddingMember(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddMember}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddingMember(true)}
          >
            <Text style={styles.buttonText}>Add Member</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={space.members}
          renderItem={({ item }) => (
            <View style={styles.memberItem}>
              <Text style={styles.memberEmail}>{item}</Text>
              {item !== userId && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveMember(item)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          keyExtractor={item => item}
          style={styles.membersList}
        />
      </View>

      <View style={styles.memoriesSection}>
        <Text style={styles.sectionTitle}>Memories in this space</Text>

        <View style={styles.addMemoryForm}>
          <TextInput
            style={styles.input}
            placeholder="Add a new memory (e.g., 'Remind me to call mom every Sunday at 5 PM')"
            value={newMemoryText}
            onChangeText={setNewMemoryText}
            multiline
          />
          <TouchableOpacity
            style={styles.addMemoryButton}
            onPress={handleAddMemory}
          >
            <Text style={styles.buttonText}>Add Memory</Text>
          </TouchableOpacity>
        </View>

        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No memories in this space yet</Text>
            <Text style={styles.emptySubtext}>Add a memory to share with your space members</Text>
          </View>
        ) : (
          <FlatList
            data={memories}
            renderItem={renderMemoryItem}
            keyExtractor={item => item.id}
            style={styles.memoriesList}
          />
        )}
      </View>
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
  membersSection: {
    marginBottom: 20,
  },
  memoriesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  addMemberForm: {
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
  addButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 4,
    marginBottom: 5,
  },
  memberEmail: {
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  membersList: {
    maxHeight: 150,
    marginBottom: 10,
  },
  addMemoryForm: {
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
  addMemoryButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  memoriesList: {
    flex: 1,
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
