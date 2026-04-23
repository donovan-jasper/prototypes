import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, PanResponder } from 'react-native';
import { WebView } from 'react-native-webview';
import { loadEpubContent, EpubContent } from '../lib/epubParser';
import { useLibraryStore } from '../store/useLibraryStore';
import { updateBook } from '../lib/database';

interface EpubRendererProps {
  filePath: string;
  onPageChange?: (chapterIndex: number) => void;
  onToggleControls?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAP_ZONE_WIDTH = SCREEN_WIDTH / 3;
const SWIPE_THRESHOLD = 50;

export default function EpubRenderer({
  filePath,
  onPageChange,
  onToggleControls
}: EpubRendererProps) {
  const [epubContent, setEpubContent] = useState<EpubContent | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { fontSize, theme, marginSize, currentBook, updateBook: updateStoreBook } = useLibraryStore();

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        const content = await loadEpubContent(filePath, currentBook?.currentPage || 0);
        setEpubContent(content);
        setCurrentChapter(content.currentChapter);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load EPUB content:', error);
        setIsLoading(false);
      }
    };

    loadContent();
  }, [filePath]);

  useEffect(() => {
    if (currentBook && currentChapter !== currentBook.currentPage) {
      updateBook(currentBook.id, { currentPage: currentChapter });
      updateStoreBook(currentBook.id, { currentPage: currentChapter });
      onPageChange?.(currentChapter);
    }
  }, [currentChapter]);

  const themeStyles = {
    light: {
      background: '#ffffff',
      text: '#000000',
      link: '#007AFF'
    },
    sepia: {
      background: '#f4ecd8',
      text: '#5c4a3a',
      link: '#8b6914'
    },
    dark: {
      background: '#1a1a1a',
      text: '#e0e0e0',
      link: '#4a9eff'
    }
  };

  const currentTheme = themeStyles[theme];

  const generateHtml = (chapterContent: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: ${fontSize}px;
              line-height: 1.6;
              color: ${currentTheme.text};
              background-color: ${currentTheme.background};
              padding: ${marginSize}px;
              overflow-x: hidden;
              ${Platform.OS === 'web' ? 'padding-bottom: 20px;' : ''}
            }
            p {
              margin-bottom: 1em;
              text-align: justify;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            h1 { font-size: 1.8em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.3em; }
            a {
              color: ${currentTheme.link};
              text-decoration: none;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 1em auto;
            }
            blockquote {
              margin: 1em 0;
              padding-left: 1em;
              border-left: 3px solid ${currentTheme.text};
              opacity: 0.8;
            }
            code {
              font-family: 'Courier New', monospace;
              background-color: rgba(0, 0, 0, 0.05);
              padding: 2px 4px;
              border-radius: 3px;
            }
            pre {
              background-color: rgba(0, 0, 0, 0.05);
              padding: 1em;
              border-radius: 5px;
              overflow-x: auto;
              margin: 1em 0;
            }
            ul, ol {
              margin: 1em 0;
              padding-left: 2em;
            }
            li {
              margin-bottom: 0.5em;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
              margin: 0;
              padding: 0;
              height: 0;
              border: none;
            }
          </style>
        </head>
        <body>
          ${chapterContent}
          <script>
            window.addEventListener('scroll', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'scroll',
                position: window.scrollY,
                maxScroll: document.body.scrollHeight - window.innerHeight
              }));
            });

            document.addEventListener('click', function(e) {
              if (e.target.tagName === 'A') {
                e.preventDefault();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'link',
                  href: e.target.href
                }));
              }
            });

            // Restore scroll position if available
            if (window.scrollPosition) {
              window.scrollTo(0, window.scrollPosition);
            }
          </script>
        </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'scroll') {
        setScrollPosition(data.position);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          if (currentBook) {
            updateBook(currentBook.id, { currentPage: currentChapter });
            updateStoreBook(currentBook.id, { currentPage: currentChapter });
          }
        }, 3000);
      } else if (data.type === 'link') {
        // Handle link navigation if needed
        console.log('Link clicked:', data.href);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      webViewRef.current?.injectJavaScript(`
        window.scrollPosition = 0;
        window.scrollTo(0, 0);
      `);
    }
  };

  const goToNextChapter = () => {
    if (epubContent && currentChapter < epubContent.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      webViewRef.current?.injectJavaScript(`
        window.scrollPosition = 0;
        window.scrollTo(0, 0);
      `);
    }
  };

  const handleTap = (event: any) => {
    const { locationX } = event.nativeEvent;

    if (locationX < TAP_ZONE_WIDTH) {
      goToPreviousChapter();
    } else if (locationX > SCREEN_WIDTH - TAP_ZONE_WIDTH) {
      goToNextChapter();
    } else {
      onToggleControls?.();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          goToPreviousChapter();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          goToNextChapter();
        }
      },
    })
  ).current;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {/* Loading indicator */}
      </View>
    );
  }

  if (!epubContent) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {/* Error message */}
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <TouchableOpacity
        style={styles.webViewContainer}
        activeOpacity={1}
        onPress={handleTap}
      >
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: generateHtml(epubContent.chapters[currentChapter].content) }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={false}
          style={styles.webView}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
          }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});
