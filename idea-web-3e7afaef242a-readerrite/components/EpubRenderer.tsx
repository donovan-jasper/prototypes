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

            // Handle tap zones
            document.addEventListener('click', function(e) {
              const x = e.clientX;
              const width = window.innerWidth;

              if (x < width / 3) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'tap',
                  zone: 'left'
                }));
              } else if (x > width * 2 / 3) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'tap',
                  zone: 'right'
                }));
              } else {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'tap',
                  zone: 'center'
                }));
              }
            });

            // Restore scroll position
            window.addEventListener('load', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ready'
              }));
            });
          </script>
        </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'scroll') {
        setScrollPosition(message.position);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          onPageChange(currentChapter);
        }, 1000);
      } else if (message.type === 'tap') {
        if (message.zone === 'left') {
          goToPreviousChapter();
        } else if (message.zone === 'right') {
          goToNextChapter();
        } else if (message.zone === 'center') {
          onToggleControls();
        }
      } else if (message.type === 'ready') {
        // Restore scroll position if available
        if (scrollPosition > 0) {
          webViewRef.current?.injectJavaScript(`
            window.scrollTo(0, ${scrollPosition});
            true;
          `);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 0) {
      const newChapter = currentChapter - 1;
      setCurrentChapter(newChapter);
      onPageChange(newChapter);
      setScrollPosition(0);
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < epubContent.chapters.length - 1) {
      const newChapter = currentChapter + 1;
      setCurrentChapter(newChapter);
      onPageChange(newChapter);
      setScrollPosition(0);
    }
  };

  useEffect(() => {
    // Update WebView content when chapter changes
    if (webViewRef.current) {
      const chapterContent = epubContent.chapters[currentChapter].content;
      const html = generateHtml(chapterContent);
      webViewRef.current.injectJavaScript(`
        document.open();
        document.write(${JSON.stringify(html)});
        document.close();
        true;
      `);
    }
  }, [currentChapter, fontSize, theme, marginSize]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: generateHtml(epubContent.chapters[currentChapter].content) }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
