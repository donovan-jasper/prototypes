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
import { getSharedUrl, processSharedUrl, isValidUrl } from '@/lib/share-extension';

export default function LibraryScreen() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [progressMessage, setProgressMessage] = useState('');
  const router = useRouter();

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
      const result = await processSharedUrl(url, (message) => {
        setProgressMessage(message);
      });

      if (result.success) {
        setUrl('');
        setShowAddModal(false);
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
      setDownloadProgress({ current: 0, total: 0 });
      setProgressMessage('');
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

  const renderProgressBar = () => {
    if (!downloading || downloadProgress.total === 0) return null;

    const progress = (downloadProgress.current / downloadProgress.total) * 100;
    const currentMB = (downloadProgress.current / 1024 / 1024).toFixed(1);
    const totalMB = (downloadProgress.total / 1024 / 1024).toFixed(1);

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {progressMessage || `Downloading... ${currentMB}MB / ${totalMB}MB`}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  };

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
          <Ionicons name="cloud-download-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No saved items yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button to save your first video, article, or image
          </Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
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
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={styles.title}>Your Library</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </View>
            }
          />
        </>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save New Item</Text>

            <TextInput
              style={styles.input}
              placeholder="Paste URL here"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus={true}
            />

            {renderProgressBar()}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
                disabled={downloading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleDownload}
                disabled={downloading || !url.trim()}
              >
                {downloading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
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
    backgroundColor: '#f5f5f5',
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
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  progressBar: {
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
});
