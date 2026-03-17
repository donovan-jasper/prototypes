import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCollections, addCollection, deleteCollection, getItems } from '@/lib/db';
import { Collection } from '@/types';
import { useRouter } from 'expo-router';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<number, number>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const router = useRouter();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const cols = await getCollections();
    setCollections(cols);

    const counts: Record<number, number> = {};
    for (const col of cols) {
      const items = await getItems({ collectionId: col.id });
      counts[col.id] = items.length;
    }
    setItemCounts(counts);
  };

  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    await addCollection(newCollectionName, selectedColor);
    setNewCollectionName('');
    setSelectedColor(COLORS[0]);
    setShowAddModal(false);
    loadCollections();
  };

  const handleDeleteCollection = (collection: Collection) => {
    Alert.alert(
      'Delete Collection',
      `Are you sure you want to delete "${collection.name}"? Items will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCollection(collection.id);
            loadCollections();
          },
        },
      ]
    );
  };

  const renderCollection = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onLongPress={() => handleDeleteCollection(item)}
    >
      <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.itemCount}>
          {itemCounts[item.id] || 0} {itemCounts[item.id] === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {collections.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No collections yet</Text>
          <Text style={styles.emptyText}>
            Create collections to organize your saved items
          </Text>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCollection}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Collection name"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
            />

            <Text style={styles.label}>Color</Text>
            <View style={styles.colorGrid}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleAddCollection}>
              <Text style={styles.createButtonText}>Create Collection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
