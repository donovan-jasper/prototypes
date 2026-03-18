import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { UserList } from '@/types';
import { getUserLists, saveUserList, deleteUserList } from '@/services/database';

const FREE_TIER_MAX_LISTS = 3;

export default function ListsScreen() {
  const router = useRouter();
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isPremium] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const userLists = await getUserLists();
      setLists(userLists);
    } catch (error) {
      console.error('Error loading lists:', error);
      Alert.alert('Error', 'Failed to load your lists');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLists();
    setRefreshing(false);
  }, []);

  const handleCreateList = () => {
    if (!isPremium && lists.length >= FREE_TIER_MAX_LISTS) {
      Alert.alert(
        'Upgrade to Premium',
        `Free tier is limited to ${FREE_TIER_MAX_LISTS} lists. Upgrade to SafeBite Pro for unlimited lists and more features.`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade to Pro', onPress: () => console.log('Navigate to upgrade') },
        ]
      );
      return;
    }
    setModalVisible(true);
  };

  const handleSaveList = async () => {
    if (newListName.trim().length === 0) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    const newList: UserList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      restaurantIds: [],
      createdAt: new Date().toISOString(),
    };

    try {
      await saveUserList(newList);
      setLists([newList, ...lists]);
      setNewListName('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving list:', error);
      Alert.alert('Error', 'Failed to create list');
    }
  };

  const handleDeleteList = (list: UserList) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUserList(list.id);
              setLists(lists.filter((l) => l.id !== list.id));
            } catch (error) {
              console.error('Error deleting list:', error);
              Alert.alert('Error', 'Failed to delete list');
            }
          },
        },
      ]
    );
  };

  const handleListPress = (list: UserList) => {
    router.push(`/list/${list.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderListItem = ({ item }: { item: UserList }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => handleListPress(item)}
      onLongPress={() => handleDeleteList(item)}
      activeOpacity={0.7}
    >
      <View style={styles.listHeader}>
        <Text style={styles.listName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.restaurantCount}>
          {item.restaurantIds.length} {item.restaurantIds.length === 1 ? 'restaurant' : 'restaurants'}
        </Text>
      </View>
      <View style={styles.listFooter}>
        <Text style={styles.createdDate}>Created {formatDate(item.createdAt)}</Text>
        <Text style={styles.tapHint}>Tap to view →</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No lists yet</Text>
      <Text style={styles.emptyText}>
        Create your first list to save your favorite restaurants
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleCreateList}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyButtonText}>Create Your First List</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Lists</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateList}
          activeOpacity={0.7}
        >
          <Text style={styles.createButtonText}>+ New List</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lists}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          lists.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter list name..."
              placeholderTextColor={Colors.textSecondary}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setNewListName('');
                  setModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveList}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSaveText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listHeader: {
    marginBottom: 12,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  restaurantCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createdDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tapHint: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalSaveButton: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});
