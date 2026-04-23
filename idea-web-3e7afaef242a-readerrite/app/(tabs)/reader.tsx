import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getBook, updateBook } from '../../lib/database';
import { loadEpubContent, EpubContent } from '../../lib/epubParser';
import EpubRenderer from '../../components/EpubRenderer';
import ReaderControls from '../../components/ReaderControls';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReaderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [epubContent, setEpubContent] = useState<EpubContent | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [marginSize, setMarginSize] = useState(20);
  const [showControls, setShowControls] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBook();
    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
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
  }, [epubContent, currentChapter, scrollPosition]);

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
      await updateBook(bookId, {
        currentPage: currentChapter,
        lastOpened: Date.now()
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handlePageChange = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    setScrollPosition(0);
  };

  const handleToggleControls = () => {
    setShowControls(!showControls);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (!showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleBack = async () => {
    await saveProgress();
    router.back();
  };

  const calculateProgress = () => {
    if (!epubContent) return 0;
    return ((currentChapter + 1) / epubContent.chapters.length) * 100;
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
  };

  const handleThemeChange = (newTheme: 'light' | 'sepia' | 'dark') => {
    setTheme(newTheme);
  };

  const handleMarginSizeChange = (size: number) => {
    setMarginSize(size);
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
        marginSize={marginSize}
        onPageChange={handlePageChange}
        onToggleControls={handleToggleControls}
      />

      {showControls && (
        <ReaderControls
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          theme={theme}
          onThemeChange={handleThemeChange}
          marginSize={marginSize}
          onMarginSizeChange={handleMarginSizeChange}
          progress={calculateProgress()}
          onClose={handleToggleControls}
        />
      )}
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
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonTextDark: {
    color: '#fff',
  },
});
