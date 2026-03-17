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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getItems, addItem } from '@/lib/db';
import { downloadMedia } from '@/lib/downloader';
import { SavedItem } from '@/types';
import ItemCard from '@/components/ItemCard';

export default function LibraryScreen() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const router = useRouter();

  useEffect(() => {
    loadItems();
  }, []);

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

    try {
      new URL(url);
    } catch {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setDownloading(true);
    setDownloadProgress({ current: 0, total: 0 });

    try {
      const result = await downloadMedia(url, (current, total) => {
        setDownloadProgress({ current, total });
      });

      const itemId = await addItem({
        url,
        title: result.title,
        type: result.type,
        fileUri: result.fileUri,
        thumbnailUri: result.thumbnailUri || null,
        source: result.source,
        createdAt: Date.now(),
        collectionId: null,
        duration: result.duration,
        fileSize: result.fileSize,
      });

      setUrl('');
      setShowAddModal(false);
      await loadItems();
      
      Alert.alert('Success', `${result.title} saved successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        error instanceof Error ? error.message : 'Failed to download content'
      );
    } finally {
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
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
          Downloading... {currentMB}MB / {totalMB}MB
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
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        disabled={downloading}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Content</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!downloading) {
                    setShowAddModal(false);
                    setUrl('');
                  }
                }}
                disabled={downloading}
              >
                <Ionicons name="close" size={28} color="#333" />
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
              editable={!downloading}
              multiline
            />

            {renderProgressBar()}

            <TouchableOpacity
              style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.downloadButtonText}>Download & Save</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.hint}>
              Supports direct video/image URLs. YouTube and social media require additional setup.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  downloadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});
