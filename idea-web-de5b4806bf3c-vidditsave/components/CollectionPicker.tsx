import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { getCollections, addCollection } from '@/lib/db';

interface Collection {
  id: number;
  name: string;
  color: string;
}

interface CollectionPickerProps {
  visible: boolean;
  onSelect: (collectionId: number) => void;
  onClose: () => void;
}

const CollectionPicker: React.FC<CollectionPickerProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addCollection: addToStore } = useStore();

  useEffect(() => {
    if (visible) {
      loadCollections();
    }
  }, [visible]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const fetchedCollections = await getCollections();
      setCollections(fetchedCollections);
    } catch (error) {
      console.error('Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    try {
      setLoading(true);
      const collectionId = await addCollection({
        name: newCollectionName,
        color: getRandomColor(),
      });

      // Update local state and store
      const newCollection = {
        id: collectionId,
        name: newCollectionName,
        color: getRandomColor(),
      };
      setCollections([...collections, newCollection]);
      addToStore(newCollection);
      setNewCollectionName('');
    } catch (error) {
      console.error('Error creating collection:', error);
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#FF9500', '#FF3B30', '#FFCC00', '#4CD964',
      '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() => onSelect(item.id)}
    >
      <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
      <Text style={styles.collectionName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Collection</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New collection name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              onSubmitEditing={handleCreateCollection}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleCreateCollection}
              disabled={loading}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={collections}
            renderItem={renderCollectionItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No collections yet</Text>
                <Text style={styles.emptySubtext}>Create one to organize your items</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
  },
  collectionName: {
    fontSize: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default CollectionPicker;
