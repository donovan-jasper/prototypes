import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity,
  Text
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getBook, updateBook } from '../../lib/database';
import { loadEpubContent, EpubContent } from '../../lib/epubParser';
import EpubRenderer from '../../components/EpubRenderer';
import ReaderControls from '../../components/ReaderControls';

export default function ReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [epubContent, setEpubContent] = useState<EpubContent | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [showControls, setShowControls] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadBook();
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (epubContent) {
      saveTimerRef.current = setInterval(() => {
        saveProgress();
      }, 30000);

      return () => {
        if (saveTimerRef.current) {
          clearInterval(saveTimerRef.current);
        }
      };
    }
  }, [epubContent, currentChapter]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const bookId = parseInt(id as string);
      const book = await getBook(bookId);

      if (!book) {
        Alert.alert('Error', 'Book not found');
        router.back();
        return;
      }

      if (book.format.toLowerCase() !== 'epub') {
        Alert.alert('Unsupported Format', 'Only EPUB files are currently supported');
        router.back();
        return;
      }

      const content = await loadEpubContent(book.filePath, book.currentPage);
      setEpubContent(content);
      setCurrentChapter(content.currentChapter);

      await updateBook(bookId, { lastOpened: Date.now() });
    } catch (error) {
      console.error('Failed to load book:', error);
      Alert.alert('Error', 'Failed to load book content');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      const bookId = parseInt(id as string);
      await updateBook(bookId, { currentPage: currentChapter });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handlePageChange = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
  };

  const handleToggleControls = () => {
    setShowControls(!showControls);
  };

  const handleBack = async () => {
    await saveProgress();
    router.back();
  };

  const calculateProgress = () => {
    if (!epubContent) return 0;
    return ((currentChapter + 1) / epubContent.chapters.length) * 100;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!epubContent) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load book</Text>
      </View>
    );
  }

  const themeBackgrounds = {
    light: '#ffffff',
    sepia: '#f4ecd8',
    dark: '#1a1a1a'
  };

  return (
    <View style={[styles.container, { backgroundColor: themeBackgrounds[theme] }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={themeBackgrounds[theme]}
      />
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
      >
        <Text style={[styles.backButtonText, theme === 'dark' && styles.backButtonTextDark]}>
          ← Library
        </Text>
      </TouchableOpacity>

      <EpubRenderer
        epubContent={epubContent}
        fontSize={fontSize}
        theme={theme}
        onPageChange={handlePageChange}
        onToggleControls={handleToggleControls}
      />

      <ReaderControls
        visible={showControls}
        fontSize={fontSize}
        theme={theme}
        progress={calculateProgress()}
        totalChapters={epubContent.chapters.length}
        currentChapter={currentChapter}
        onFontSizeChange={setFontSize}
        onThemeChange={setTheme}
        onClose={() => setShowControls(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  backButtonTextDark: {
    color: '#4a9eff',
  }
});
