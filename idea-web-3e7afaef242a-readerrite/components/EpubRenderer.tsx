import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, PanResponder } from 'react-native';
import { WebView } from 'react-native-webview';
import { EpubContent } from '../lib/epubParser';

interface EpubRendererProps {
  epubContent: EpubContent;
  fontSize: number;
  theme: 'light' | 'sepia' | 'dark';
  marginSize: number;
  onPageChange: (chapterIndex: number) => void;
  onToggleControls: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAP_ZONE_WIDTH = SCREEN_WIDTH / 3;
const SWIPE_THRESHOLD = 50;

export default function EpubRenderer({
  epubContent,
  fontSize,
  theme,
  marginSize,
  onPageChange,
  onToggleControls
}: EpubRendererProps) {
  const [currentChapter, setCurrentChapter] = useState(epubContent.currentChapter);
  const [scrollPosition, setScrollPosition] = useState(0);
  const webViewRef = useRef<WebView>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

            window.addEventListener('message', function(event) {
              const data = JSON.parse(event.data);
              if (data.type === 'highlight') {
                const selection = window.getSelection();
                if (selection && selection.toString().length > 0) {
                  const range = selection.getRangeAt(0);
                  const rect = range.getBoundingClientRect();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'highlight',
                    text: selection.toString(),
                    position: {
                      x: rect.left,
                      y: rect.top,
                      width: rect.width,
                      height: rect.height
                    }
                  }));
                }
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

  const goToPreviousChapter = () => {
    if (currentChapter > 0) {
      const newChapter = currentChapter - 1;
      setCurrentChapter(newChapter);
      onPageChange(newChapter);
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < epubContent.chapters.length - 1) {
      const newChapter = currentChapter + 1;
      setCurrentChapter(newChapter);
      onPageChange(newChapter);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'scroll') {
        setScrollPosition(data.position);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          // Save scroll position to database
          // This would be implemented in the parent component
        }, 1000);
      } else if (data.type === 'link') {
        // Handle link navigation
        console.log('Link clicked:', data.href);
      } else if (data.type === 'highlight') {
        // Handle text selection
        console.log('Text selected:', data.text);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    if (locationX < TAP_ZONE_WIDTH) {
      goToPreviousChapter();
    } else if (locationX > SCREEN_WIDTH - TAP_ZONE_WIDTH) {
      goToNextChapter();
    } else {
      onToggleControls();
    }
  };

  useEffect(() => {
    // Update WebView content when chapter changes
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.scrollPosition = ${scrollPosition};
        true;
      `);
    }
  }, [currentChapter]);

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
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={false}
          style={styles.webView}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
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
