import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, Dimensions, PanResponder, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getContent, saveReadingProgress, getReadingProgress } from '../utils/offlineLibrary';

const { width, height } = Dimensions.get('window');

const Reader = ({ route }: any) => {
  const { contentId } = route.params;
  const [content, setContent] = useState<any>(null);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('System');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setShowControls(true);
        resetControlsTimeout();
      },
      onPanResponderMove: (evt, gestureState) => {
        // Handle swipe gestures for page turning
        if (gestureState.dx > 50) {
          // Swipe right - go to previous page
          scrollViewRef.current?.scrollTo({ y: Math.max(0, scrollPosition - scrollViewHeight), animated: true });
        } else if (gestureState.dx < -50) {
          // Swipe left - go to next page
          scrollViewRef.current?.scrollTo({ y: Math.min(contentHeight - scrollViewHeight, scrollPosition + scrollViewHeight), animated: true });
        }
      },
    })
  ).current;

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const result = await getContent(contentId);
        setContent(result);

        // Load saved progress
        const progress = await getReadingProgress(contentId);
        if (progress && progress.scroll_position > 0) {
          setScrollPosition(progress.scroll_position);
          // Restore scroll position after a short delay to ensure layout is complete
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: progress.scroll_position, animated: false });
          }, 100);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load content');
      }
    };
    loadContent();

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [contentId]);

  useEffect(() => {
    resetControlsTimeout();
  }, [showControls, resetControlsTimeout]);

  const calculatePercentage = useCallback((scrollY: number) => {
    if (contentHeight <= scrollViewHeight) return 100;
    const maxScroll = contentHeight - scrollViewHeight;
    return Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
  }, [contentHeight, scrollViewHeight]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const newScrollPosition = contentOffset.y;
    setScrollPosition(newScrollPosition);
    setContentHeight(contentSize.height);
    setScrollViewHeight(layoutMeasurement.height);

    // Debounce save to avoid too frequent writes
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const percentage = calculatePercentage(newScrollPosition);
      saveReadingProgress(contentId, newScrollPosition, percentage);
    }, 2000);
  }, [contentId, calculatePercentage]);

  const handleShareProgress = useCallback(async () => {
    if (!content) return;

    const percentage = calculatePercentage(scrollPosition);
    const message = `I'm ${Math.round(percentage)}% through ${content.title} on PageTurner Pro!`;

    try {
      await Share.share({
        message: message,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share progress');
    }
  }, [content, scrollPosition, calculatePercentage]);

  const handleBrightnessChange = useCallback((value: number) => {
    setBrightness(value);
    // In a real app, you would use NativeModules to adjust device brightness
    // This is just a simulation
    console.log(`Brightness set to ${value}%`);
  }, []);

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(32, prev + 2));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(12, prev - 2));
  }, []);

  const changeFontFamily = useCallback(() => {
    setFontFamily(prev => prev === 'System' ? 'serif' : 'System');
  }, []);

  if (!content) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const currentPercentage = calculatePercentage(scrollPosition);

  return (
    <View style={[styles.container, { backgroundColor: `rgba(0, 0, 0, ${brightness / 100})` }]} {...panResponder.panHandlers}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={(event) => setScrollViewHeight(event.nativeEvent.layout.height)}
      >
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { fontSize: fontSize + 4, fontFamily }]}>{content.title}</Text>
          <Text style={[styles.text, { fontSize, fontFamily }]}>{content.text}</Text>
        </View>
      </ScrollView>

      {showControls && (
        <Animated.View style={styles.controlsContainer}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{Math.round(currentPercentage)}%</Text>
          </View>

          <View style={styles.fontControls}>
            <TouchableOpacity style={styles.controlButton} onPress={decreaseFontSize}>
              <Text style={styles.controlButtonText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={increaseFontSize}>
              <Text style={styles.controlButtonText}>A+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={changeFontFamily}>
              <Text style={styles.controlButtonText}>Font</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShareProgress}>
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.goBack()}>
              <Text style={styles.actionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {!showControls && (
        <TouchableOpacity style={styles.tapArea} onPress={toggleControls} activeOpacity={1} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  text: {
    color: '#fff',
    lineHeight: 24,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
  },
  fontControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  controlButtonText: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default Reader;
