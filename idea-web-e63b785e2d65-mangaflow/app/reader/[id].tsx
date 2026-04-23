import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, StyleSheet, Text, StatusBar, TouchableOpacity, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import GestureReader from '../../components/GestureReader';
import { getMangaById, updateMangaProgress } from '../../lib/db';
import { getAllPages } from '../../lib/storage';
import { Manga } from '../../types';
import { uploadSyncData } from '../../lib/sync';
import { useUserStore } from '../../store/user';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isPremium } = useUserStore();
  const [manga, setManga] = useState<Manga | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

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

      // Auto-sync progress if enabled and user is premium
      if (isPremium && autoSyncEnabled) {
        try {
          await uploadSyncData();
        } catch (error) {
          console.error('Auto-sync failed:', error);
        }
      }
    }
  };

  const handleReadingModeChange = async (mode: 'ltr' | 'rtl' | 'vertical') => {
    if (!manga) return;

    const db = await import('../../lib/db');
    await db.initDB();
    const database = await import('expo-sqlite').then(m => m.openDatabaseAsync('pageturn.db'));
    await database.runAsync(
      'UPDATE manga SET readingMode = ? WHERE id = ?',
      [mode, manga.id]
    );

    setManga({ ...manga, readingMode: mode });
    setShowSettings(false);
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
        readingMode={manga.readingMode}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setShowSettings(true)}
      >
        <Text style={styles.settingsButtonText}>⚙</Text>
      </TouchableOpacity>

      <View style={styles.pageCounter}>
        <Text style={styles.pageCounterText}>
          {currentPage + 1}/{pages.length}
        </Text>
      </View>

      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={styles.settingsModal}>
            <Text style={styles.settingsTitle}>Reading Mode</Text>

            <TouchableOpacity
              style={[
                styles.modeButton,
                manga.readingMode === 'ltr' && styles.modeButtonActive,
              ]}
              onPress={() => handleReadingModeChange('ltr')}
            >
              <Text style={styles.modeButtonText}>Left to Right</Text>
              {manga.readingMode === 'ltr' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                manga.readingMode === 'rtl' && styles.modeButtonActive,
              ]}
              onPress={() => handleReadingModeChange('rtl')}
            >
              <Text style={styles.modeButtonText}>Right to Left</Text>
              {manga.readingMode === 'rtl' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                manga.readingMode === 'vertical' && styles.modeButtonActive,
              ]}
              onPress={() => handleReadingModeChange('vertical')}
            >
              <Text style={styles.modeButtonText}>Vertical Scroll</Text>
              {manga.readingMode === 'vertical' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            {isPremium && (
              <>
                <Text style={styles.settingsTitle}>Cloud Sync</Text>

                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    autoSyncEnabled && styles.modeButtonActive,
                  ]}
                  onPress={() => setAutoSyncEnabled(!autoSyncEnabled)}
                >
                  <Text style={styles.modeButtonText}>Auto-sync progress</Text>
                  {autoSyncEnabled && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 20,
  },
  pageCounter: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  pageCounterText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModal: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  modeButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  modeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
