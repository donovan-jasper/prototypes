import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { EpubContent } from '../lib/epubParser';

interface EpubRendererProps {
  epubContent: EpubContent;
  fontSize: number;
  theme: 'light' | 'sepia' | 'dark';
  onPageChange: (chapterIndex: number) => void;
  onToggleControls: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAP_ZONE_WIDTH = SCREEN_WIDTH / 3;

export default function EpubRenderer({
  epubContent,
  fontSize,
  theme,
  onPageChange,
  onToggleControls
}: EpubRendererProps) {
  const [currentChapter, setCurrentChapter] = useState(epubContent.currentChapter);
  const webViewRef = useRef<WebView>(null);

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
              padding: 20px;
              overflow-x: hidden;
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
          </style>
        </head>
        <body>
          ${chapterContent}
        </body>
      </html>
    `;
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

  useEffect(() => {
    if (webViewRef.current) {
      const html = generateHtml(epubContent.chapters[currentChapter].content);
      webViewRef.current.injectJavaScript(`
        document.open();
        document.write(\`${html.replace(/`/g, '\\`')}\`);
        document.close();
      `);
    }
  }, [currentChapter, fontSize, theme]);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleTap}
    >
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: generateHtml(epubContent.chapters[currentChapter].content) }}
        style={styles.webview}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        bounces={false}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});
