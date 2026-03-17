import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { getBook, updateBook } from '../../lib/database';
import { loadEpubContent, EpubContent } from '../../lib/epubParser';
import type { Book } from '../../lib/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAP_ZONE_WIDTH = SCREEN_WIDTH / 3;

type Theme = 'light' | 'dark' | 'sepia';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [epubContent, setEpubContent] = useState<EpubContent | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [theme, setTheme] = useState<Theme>('light');
  const [showControls, setShowControls] = useState(false);
  
  const webViewRef = useRef<WebView>(null);
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadBook();
  }, [id]);

  useEffect(() => {
    if (showControls) {
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
      
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      
      hideControlsTimeout.current = setTimeout(() => {
        hideControls();
      }, 3000);
    } else {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    }
    
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [showControls]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const bookId = parseInt(id as string);
      const loadedBook = await getBook(bookId);
      
      if (!loadedBook) {
        Alert.alert('Error', 'Book not found');
        router.back();
        return;
      }
      
      setBook(loadedBook);
      
      if (loadedBook.format.toLowerCase() === 'epub') {
        const content = await loadEpubContent(
          loadedBook.filePath,
          loadedBook.currentPage
        );
        
        setEpubContent(content);
        setCurrentChapter(content.currentChapter);
      } else {
        setEpubContent({
          metadata: { title: loadedBook.title, author: loadedBook.author },
          chapters: [{
            id: 'unsupported',
            href: '',
            title: 'Unsupported Format',
            content: `
              <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; padding: 20px;">
                <div>
                  <h2>Format Not Supported</h2>
                  <p>Currently only EPUB files are supported in the reader.</p>
                  <p>Support for ${loadedBook.format.toUpperCase()} files is coming soon.</p>
                </div>
              </div>
            `
          }],
          currentChapter: 0,
          toc: []
        });
      }
    } catch (error) {
      console.error('Failed to load book:', error);
      Alert.alert('Error', 'Failed to load book content');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const hideControls = () => {
    setShowControls(false);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleTap = (x: number) => {
    if (x < TAP_ZONE_WIDTH) {
      previousPage();
    } else if (x > SCREEN_WIDTH - TAP_ZONE_WIDTH) {
      nextPage();
    } else {
      toggleControls();
    }
  };

  const previousPage = async () => {
    if (currentChapter > 0 && epubContent && book) {
      const newChapter = currentChapter - 1;
      setCurrentChapter(newChapter);
      await updateBook(book.id, { currentPage: newChapter });
    }
  };

  const nextPage = async () => {
    if (epubContent && currentChapter < epubContent.chapters.length - 1 && book) {
      const newChapter = currentChapter + 1;
      setCurrentChapter(newChapter);
      await updateBook(book.id, { currentPage: newChapter });
    }
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'sepia'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return { backgroundColor: '#1a1a1a', color: '#e0e0e0' };
      case 'sepia':
        return { backgroundColor: '#f4ecd8', color: '#5c4a3a' };
      case 'light':
      default:
        return { backgroundColor: '#ffffff', color: '#000000' };
    }
  };

  const themeStyles = getThemeStyles();

  const injectedCSS = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 18px;
        line-height: 1.6;
        padding: 20px;
        margin: 0;
        background-color: ${themeStyles.backgroundColor};
        color: ${themeStyles.color};
      }
      img {
        max-width: 100%;
        height: auto;
      }
      p {
        margin-bottom: 1em;
      }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      a {
        color: ${theme === 'dark' ? '#4da6ff' : '#007AFF'};
      }
    </style>
  `;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!book || !epubContent) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  const currentChapterContent = epubContent.chapters[currentChapter]?.content || '';
  
  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        ${injectedCSS}
      </head>
      <body>
        ${currentChapterContent}
      </body>
    </html>
  `;

  const progress = epubContent.chapters.length > 0 
    ? ((currentChapter + 1) / epubContent.chapters.length) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tapArea}
        activeOpacity={1}
        onPress={(e) => handleTap(e.nativeEvent.locationX)}
      >
        <WebView
          ref={webViewRef}
          source={{ html: wrappedHtml }}
          style={[styles.webview, { backgroundColor: themeStyles.backgroundColor }]}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      </TouchableOpacity>

      <Animated.View style={[styles.controlsContainer, { opacity: controlsOpacity }]}>
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {book.title}
            </Text>
            <Text style={styles.chapterTitle} numberOfLines={1}>
              {epubContent.chapters[currentChapter]?.title || ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.themeButton} onPress={cycleTheme}>
            <Text style={styles.themeButtonText}>
              {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '📄'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentChapter + 1} / {epubContent.chapters.length}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  tapArea: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  chapterTitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  themeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 24,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
});
