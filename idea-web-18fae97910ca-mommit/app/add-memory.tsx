import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemoryStore } from '../store/memoryStore';
import { createMemory, addMemoryToSpace, getSpacesForUser } from '../lib/db';
import { parseNaturalLanguage } from '../lib/ai';
import { Space } from '../lib/types';
import SpaceCard from '../components/SpaceCard';

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
                keyExtractor={item => item.id}
                contentContainerStyle={styles.spaceList}
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
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2c3e50',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  spaceButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  addButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  spaceSelectorModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  spaceSelectorContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
  },
  spaceSelectorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  spaceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  selectedSpaceItem: {
    backgroundColor: '#e8f4fc',
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  spaceMembers: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  spaceList: {
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginVertical: 24,
  },
  closeButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
