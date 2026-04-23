import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { getItems, addItem } from '@/lib/db';
import { downloadMedia } from '@/lib/downloader';
import { SavedItem } from '@/types';
import ItemCard from '@/components/ItemCard';
import DownloadProgress from '@/components/DownloadProgress';
import { getSharedUrl, processSharedUrl, isValidUrl } from '@/lib/share-extension';
import { useStore } from '@/store/useStore';

export default function LibraryScreen() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [progressMessage, setProgressMessage] = useState('');
  const [currentItemId, setCurrentItemId] = useState<number | undefined>();
  const router = useRouter();
  const { items: storeItems, setItems: setStoreItems } = useStore();

  useEffect(() => {
    loadItems();
    checkForSharedUrl();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  const checkForSharedUrl = async () => {
    try {
      const sharedUrl = await getSharedUrl();
      if (sharedUrl && isValidUrl(sharedUrl)) {
        setUrl(sharedUrl);
        setShowAddModal(true);
        handleDownload();
      }
    } catch (error) {
      console.error('Error checking for shared URL:', error);
  }
  };

  const loadItems = async () => {
    try {
      const fetchedItems = await getItems();
      setItems(fetchedItems);
      setStoreItems(fetchedItems);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, []);

  const handleDownload = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setDownloading(true);
    setDownloadProgress({ current: 0, total: 0 });
    setProgressMessage('Starting download...');

    try {
      const result = await processSharedUrl(url, (message, progress) => {
        setProgressMessage(message);
        if (progress) {
          setDownloadProgress(progress);
        }
      });

      if (result.success) {
        setUrl('');
        setShowAddModal(false);
        setCurrentItemId(result.itemId);
        await loadItems();
      } else {
        Alert.alert('Download Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        error instanceof Error ? error.message : 'Failed to download content'
      );
    } finally {
      setDownloading(false);
    }
  };

  const renderItem = ({ item }: { item: SavedItem }) => (
    <ItemCard
      item={item}
      onPress={() => router.push(`/item/${item.id}`)}
      onLongPress={() => {
        Alert.alert(
          item.title,
          'What would you like to do?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                const { deleteItem } = await import('@/lib/db');
                const { deleteFile } = await import('@/lib/storage');

                if (item.fileUri) {
                  await deleteFile(item.fileUri);
                }
                if (item.thumbnailUri) {
                  await deleteFile(item.thumbnailUri);
                }
                await deleteItem(item.id);
                await loadItems();
              },
            },
          ]
        );
      }}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptySubtitle}>
            Save content from any app using the share sheet
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Add Content</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#007AFF"
              />
            }
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={styles.title}>Library</Text>
                <TouchableOpacity
                  style={styles.addIcon}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Content</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Paste URL here"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.downloadButtonText}>Download</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DownloadProgress
        visible={downloading}
        progress={(downloadProgress.current / downloadProgress.total) * 100 || 0}
        message={progressMessage}
        itemId={currentItemId}
        onClose={() => {
          setDownloading(false);
          setCurrentItemId(undefined);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centerContainer: {
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addIcon: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
