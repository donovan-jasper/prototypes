import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useStore } from '@/store/useStore';
import { ItemCard } from '@/components/ItemCard';
import { SearchBar } from '@/components/SearchBar';
import { getSharedUrl, processSharedUrl } from '@/lib/share-extension';
import { DownloadProgress } from '@/components/DownloadProgress';
import { SavedItem } from '@/types';
import { useRouter } from 'expo-router';

export default function LibraryScreen() {
  const { items, fetchItems, isLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    message: string;
    progress?: { current: number; total: number };
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchItems();
    checkForSharedContent();
  }, []);

  const checkForSharedContent = async () => {
    const sharedUrl = await getSharedUrl();
    if (sharedUrl) {
      setIsDownloading(true);
      const result = await processSharedUrl(sharedUrl, (message, progress) => {
        setDownloadProgress({ message, progress });
      });
      setIsDownloading(false);
      setDownloadProgress(null);

      if (result.success) {
        fetchItems();
      }
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    await fetchItems();
  };

  const renderItem = ({ item }: { item: SavedItem }) => (
    <ItemCard
      item={item}
      onPress={() => router.push(`/item/${item.id}`)}
    />
  );

  if (isDownloading && downloadProgress) {
    return (
      <View style={styles.container}>
        <DownloadProgress
          message={downloadProgress.message}
          progress={downloadProgress.progress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search your library"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your library is empty</Text>
            <Text style={styles.emptySubtext}>Share content from other apps to save it here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
