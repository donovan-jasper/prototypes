import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemoryStore } from '../store/memoryStore';
import { createMemory, addMemoryToSpace, getSpacesForUser } from '../lib/db';
import { parseNaturalLanguage } from '../lib/ai';
import { Space } from '../lib/types';

export default function AddMemoryModal() {
  const [memoryText, setMemoryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);
  const router = useRouter();
  const { userId, addMemory, fetchMemories } = useMemoryStore();

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    if (!userId) return;

    try {
      const userSpaces = await getSpacesForUser(userId);
      setSpaces(userSpaces);
    } catch (error) {
      console.error('Failed to load spaces:', error);
    }
  };

  const handleAddMemory = async () => {
    if (!memoryText.trim()) {
      Alert.alert('Error', 'Please enter a memory description');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      // Parse the natural language input
      const parsed = await parseNaturalLanguage(memoryText);

      // Create the memory in the database
      const memory = await createMemory(
        parsed.title,
        parsed.description,
        parsed.triggerType,
        parsed.triggerValue,
        userId
      );

      // Add to selected space if one is selected
      if (selectedSpace) {
        await addMemoryToSpace(selectedSpace.id, memory.id);
      }

      // Update the global state
      addMemory(memory);
      await fetchMemories();

      // Close the modal
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to add memory');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSpaceItem = ({ item }: { item: Space }) => (
    <TouchableOpacity
      style={[
        styles.spaceItem,
        selectedSpace?.id === item.id && styles.selectedSpaceItem
      ]}
      onPress={() => {
        setSelectedSpace(item);
        setShowSpaceSelector(false);
      }}
    >
      <Text style={styles.spaceName}>{item.name}</Text>
      <Text style={styles.spaceMembers}>{item.members.length} members</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Add New Memory</Text>

        <TextInput
          style={styles.input}
          placeholder="Describe your memory (e.g., 'Remind me to call mom every Sunday at 5 PM')"
          value={memoryText}
          onChangeText={setMemoryText}
          multiline
          numberOfLines={4}
        />

        <View style={styles.spaceSelector}>
          <Text style={styles.sectionTitle}>Shared Space</Text>
          <TouchableOpacity
            style={styles.spaceButton}
            onPress={() => setShowSpaceSelector(true)}
          >
            <Text style={styles.spaceButtonText}>
              {selectedSpace ? selectedSpace.name : 'Select a space (optional)'}
            </Text>
          </TouchableOpacity>

          {selectedSpace && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedSpace(null)}
            >
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddMemory}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Adding...' : 'Add Memory'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSpaceSelector}
        onRequestClose={() => setShowSpaceSelector(false)}
      >
        <View style={styles.spaceSelectorModal}>
          <View style={styles.spaceSelectorContent}>
            <Text style={styles.spaceSelectorTitle}>Select a Space</Text>

            {spaces.length === 0 ? (
              <Text style={styles.emptyText}>You don't have any spaces yet.</Text>
            ) : (
              <FlatList
                data={spaces}
                renderItem={renderSpaceItem}
                keyExtractor={(item) => item.id}
                style={styles.spaceList}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSpaceSelector(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
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
  input: {
    height: 120,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  spaceSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  spaceButton: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  spaceButtonText: {
    color: '#333',
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    color: '#f44336',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
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
  addButton: {
    backgroundColor: '#4CAF50',
  },
  spaceSelectorModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  spaceSelectorContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  spaceSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  spaceList: {
    maxHeight: 300,
  },
  spaceItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedSpaceItem: {
    backgroundColor: '#e8f5e9',
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '600',
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
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
