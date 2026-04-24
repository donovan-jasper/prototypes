import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { IconButton, Text, Surface } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

interface SlideViewerProps {
  html: string;
  testID?: string;
}

export default function SlideViewer({ html, testID }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(1);
  const webViewRef = useRef<WebView>(null);

  const injectedJavaScript = `
    (function() {
      const slides = document.querySelectorAll('.slide');
      let currentIndex = 0;

      window.totalSlides = slides.length;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'init',
        totalSlides: slides.length
      }));

      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.style.display = i === index ? 'flex' : 'none';
        });
        currentIndex = index;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'slideChange',
          currentSlide: index + 1
        }));
      }

      window.nextSlide = function() {
        if (currentIndex < slides.length - 1) {
          showSlide(currentIndex + 1);
        }
      };

      window.prevSlide = function() {
        if (currentIndex > 0) {
          showSlide(currentIndex - 1);
        }
      };

      // Handle touch events for swipe navigation
      let touchStartX = 0;
      let touchStartY = 0;

      document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, false);

      document.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;

        // Only handle horizontal swipes
        if (Math.abs(touchEndY - touchStartY) > 50) return;

        if (touchEndX < touchStartX - 50) {
          // Swipe left - next slide
          window.nextSlide();
        } else if (touchEndX > touchStartX + 50) {
          // Swipe right - previous slide
          window.prevSlide();
        }
      }, false);

      showSlide(0);
    })();
    true;
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'init') {
        setTotalSlides(data.totalSlides);
      } else if (data.type === 'slideChange') {
        setCurrentSlide(data.currentSlide);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  };

  const goToNextSlide = () => {
    webViewRef.current?.injectJavaScript('window.nextSlide(); true;');
  };

  const goToPrevSlide = () => {
    webViewRef.current?.injectJavaScript('window.prevSlide(); true;');
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        testID={testID}
        source={{ html }}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />

      <Surface style={styles.controls} elevation={4}>
        <IconButton
          icon="chevron-left"
          size={28}
          onPress={goToPrevSlide}
          disabled={currentSlide === 1}
        />
        <Text variant="bodyLarge" style={styles.counter}>
          {currentSlide} / {totalSlides}
        </Text>
        <IconButton
          icon="chevron-right"
          size={28}
          onPress={goToNextSlide}
          disabled={currentSlide === totalSlides}
        />
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  controls: {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: [{ translateX: -80 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 8,
  },
  counter: {
    marginHorizontal: 8,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
});
