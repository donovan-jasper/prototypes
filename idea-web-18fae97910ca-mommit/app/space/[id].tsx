import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemoryStore } from '../../store/memoryStore';
import { Memory, Space } from '../../lib/types';
import { getSpaceById, addMemberToSpace, removeMemberFromSpace, getMemoriesForSpace } from '../../lib/db';
import MemoryCard from '../../components/MemoryCard';

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const router = useRouter();
  const { userId } = useMemoryStore();

  useEffect(() => {
    if (id) {
      loadSpaceData();
    }
  }, [id]);

  const loadSpaceData = async () => {
    try {
      const spaceData = await getSpaceById(id);
      setSpace(spaceData);

      const spaceMemories = await getMemoriesForSpace(id);
      setMemories(spaceMemories);
    } catch (error) {
      Alert.alert('Error', 'Failed to load space data');
      router.back();
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      await addMemberToSpace(id, newMemberEmail);
      setSpace(prev => prev ? { ...prev, members: [...prev.members, newMemberEmail] } : null);
      setNewMemberEmail('');
      setIsAddingMember(false);
      Alert.alert('Success', 'Member added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add member');
    }
  };

  const handleRemoveMember = async (email: string) => {
    try {
      await removeMemberFromSpace(id, email);
      setSpace(prev => prev ? {
        ...prev,
        members: prev.members.filter(member => member !== email)
      } : null);
      Alert.alert('Success', 'Member removed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove member');
    }
  };

  const renderMemoryItem = ({ item }: { item: Memory }) => (
    <MemoryCard memory={item} />
  );

  if (!space) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading space...</Text>
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
        <FlatList
          data={memories}
          renderItem={renderMemoryItem}
          keyExtractor={item => item.id}
          style={styles.memoriesList}
        />
      </View>

      <TouchableOpacity
        style={styles.addMemoryButton}
        onPress={() => router.push('/add-memory?spaceId=' + id)}
      >
        <Text style={styles.addMemoryButtonText}>Add Memory to Space</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
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
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  membersList: {
    maxHeight: 150,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  memoriesSection: {
    flex: 1,
  },
  memoriesList: {
    flex: 1,
  },
  addMemoryButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addMemoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
