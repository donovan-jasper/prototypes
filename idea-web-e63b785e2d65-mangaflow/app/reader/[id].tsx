import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, StyleSheet, Text, StatusBar, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import GestureReader from '../../components/GestureReader';
import { getMangaById, updateMangaProgress } from '../../lib/db';
import { getAllPages } from '../../lib/storage';
import { Manga } from '../../types';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [manga, setManga] = useState<Manga | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManga();
  }, [id]);

  const loadManga = async () => {
    try {
      const mangaData = await getMangaById(id);
      if (!mangaData) {
        router.back();
        return;
      }

      const pageUris = await getAllPages(mangaData.id);
      setManga(mangaData);
      setPages(pageUris);
      setCurrentPage(mangaData.currentPage);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load manga:', error);
      router.back();
    }
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    if (manga) {
      await updateMangaProgress(manga.id, newPage);
    }
  };

  if (loading || !manga || pages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar hidden />
      
      <GestureReader
        pages={pages.map((uri) => ({ uri }))}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.pageCounter}>
        <Text style={styles.pageCounterText}>
          {currentPage + 1}/{pages.length}
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  pageCounter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageCounterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
