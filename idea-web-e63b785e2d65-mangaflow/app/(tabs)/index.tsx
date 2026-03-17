import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getAllManga } from '../../lib/db';
import { Manga } from '../../types';
import MangaCover from '../../components/MangaCover';
import ImportButton from '../../components/ImportButton';

export default function LibraryScreen() {
  const router = useRouter();
  const [manga, setManga] = useState<Manga[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadManga = async () => {
    try {
      const data = await getAllManga();
      setManga(data);
    } catch (error) {
      console.error('Failed to load manga:', error);
    }
  };

  useEffect(() => {
    loadManga();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadManga();
    setRefreshing(false);
  };

  const handleMangaPress = (mangaItem: Manga) => {
    router.push(`/reader/${mangaItem.id}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={manga}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MangaCover manga={item} onPress={() => handleMangaPress(item)} />
        )}
        ListHeaderComponent={
          <ImportButton onImportComplete={loadManga} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No manga in your library</Text>
            <Text style={styles.emptySubtext}>
              Tap "Import Manga" to get started
            </Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
  },
});
