import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemoryStore } from '../../store/memoryStore';
import { Memory, Space } from '../../lib/types';
import { getSpaceById, addMemberToSpace, removeMemberFromSpace, getMemoriesForSpace, createMemory, addMemoryToSpace } from '../../lib/db';
import MemoryCard from '../../components/MemoryCard';
import { parseNaturalLanguage } from '../../lib/ai';

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
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
      await addMemoryToSpace(id, memory.id);

      // Update local state
      setMemories([memory, ...memories]);
      setNewMemoryText('');
      setIsAddingMemory(false);

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

  const renderMemberItem = ({ item }: { item: string }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberEmail}>{item}</Text>
      {space?.owner_id === userId && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveMember(item)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{space.name}</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members ({space.members.length})</Text>
          {space.owner_id === userId && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAddingMember(true)}
            >
              <Text style={styles.addButtonText}>Add Member</Text>
            </TouchableOpacity>
          )}
        </View>

        {isAddingMember && (
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
        )}

        <FlatList
          data={space.members}
          renderItem={renderMemberItem}
          keyExtractor={(item) => item}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Memories ({memories.length})</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddingMemory(true)}
          >
            <Text style={styles.addButtonText}>Add Memory</Text>
          </TouchableOpacity>
        </View>

        {isAddingMemory && (
          <View style={styles.addMemoryForm}>
            <TextInput
              style={styles.input}
              placeholder="Describe the memory..."
              value={newMemoryText}
              onChangeText={setNewMemoryText}
              multiline
              numberOfLines={3}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsAddingMemory(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddMemory}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No memories in this space yet. Add one to get started!</Text>
          </View>
        ) : (
          <FlatList
            data={memories}
            renderItem={renderMemoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberEmail: {
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: '#f44336',
    padding: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  addMemberForm: {
    marginBottom: 16,
  },
  addMemoryForm: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
