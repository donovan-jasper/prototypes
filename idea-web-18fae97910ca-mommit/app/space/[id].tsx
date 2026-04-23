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
          <Text style={styles.sectionTitle}>Members</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddingMember(true)}
          >
            <Text style={styles.addButtonText}>Add Member</Text>
          </TouchableOpacity>
        </View>

        {isAddingMember && (
          <View style={styles.addMemberForm}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
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
                style={[styles.button, styles.confirmButton]}
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
          keyExtractor={item => item}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shared Memories</Text>
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
              placeholder="Describe your memory (e.g., 'Remind me to call mom every Sunday at 5 PM')"
              value={newMemoryText}
              onChangeText={setNewMemoryText}
              multiline
              numberOfLines={4}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsAddingMemory(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleAddMemory}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {memories.length > 0 ? (
          <FlatList
            data={memories}
            renderItem={renderMemoryItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No memories in this space yet.</Text>
            <Text style={styles.emptySubtext}>Add a memory to share with your space members.</Text>
          </View>
        )}
      </View>
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
  section: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  memberEmail: {
    fontSize: 16,
    color: '#2c3e50',
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  addMemberForm: {
    marginBottom: 16,
  },
  addMemoryForm: {
    marginBottom: 16,
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
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
