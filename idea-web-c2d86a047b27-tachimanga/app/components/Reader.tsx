import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, Dimensions, PanResponder, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getContent, saveReadingProgress, getReadingProgress } from '../utils/offlineLibrary';
import Slider from '@react-native-community/slider';

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
    if (!showControls) {
      resetControlsTimeout();
    }
  }, [showControls, resetControlsTimeout]);

  if (!content) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: `rgba(0, 0, 0, ${1 - brightness/100})` }]}>
      <StatusBar hidden={!showControls} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        {...panResponder.panHandlers}
      >
        <View style={styles.contentContainer}>
          {content.pages.map((page: any, index: number) => (
            <View key={index} style={styles.pageContainer}>
              <Text style={[styles.pageText, { fontSize, fontFamily }]}>
                {page.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{content.title}</Text>
            <TouchableOpacity onPress={handleShareProgress} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <View style={styles.fontControls}>
              <Text style={styles.controlLabel}>Font Size</Text>
              <Slider
                style={styles.slider}
                minimumValue={12}
                maximumValue={24}
                step={1}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
              />
            </View>

            <View style={styles.brightnessControls}>
              <Text style={styles.controlLabel}>Brightness</Text>
              <Slider
                style={styles.slider}
                minimumValue={20}
                maximumValue={100}
                step={1}
                value={brightness}
                onValueChange={handleBrightnessChange}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#000000"
              />
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {Math.round(calculatePercentage(scrollPosition))}% complete
              </Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.tapArea}
        onPress={toggleControls}
        activeOpacity={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  pageContainer: {
    marginBottom: 30,
  },
  pageText: {
    color: '#FFFFFF',
    lineHeight: 24,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareButton: {
    padding: 10,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  bottomControls: {
    paddingBottom: 20,
  },
  fontControls: {
    marginBottom: 20,
  },
  brightnessControls: {
    marginBottom: 20,
  },
  controlLabel: {
    color: '#FFFFFF',
    marginBottom: 5,
    fontSize: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
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
