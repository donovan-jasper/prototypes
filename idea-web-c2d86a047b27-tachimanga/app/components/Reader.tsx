import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, Dimensions, PanResponder, StatusBar, Animated, Easing } from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    // Animate brightness change
    Animated.timing(fadeAnim, {
      toValue: brightness / 100,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [brightness]);

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

  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (!showControls) {
      resetControlsTimeout();
    }
  };

  if (!content) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={!showControls} />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        {...panResponder.panHandlers}
      >
        <Text style={[styles.contentText, { fontSize, fontFamily }]}>
          {content.text}
        </Text>
      </ScrollView>

      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.titleText}>{content.title}</Text>
            <TouchableOpacity onPress={handleShareProgress} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Font Size</Text>
              <Slider
                style={styles.slider}
                minimumValue={12}
                maximumValue={24}
                step={1}
                value={fontSize}
                onValueChange={handleFontSizeChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#007AFF"
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Brightness</Text>
              <Slider
                style={styles.slider}
                minimumValue={20}
                maximumValue={100}
                step={1}
                value={brightness}
                onValueChange={handleBrightnessChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#007AFF"
              />
            </View>

            <View style={styles.fontFamilyContainer}>
              <Text style={styles.sliderLabel}>Font Style</Text>
              <View style={styles.fontButtons}>
                <TouchableOpacity
                  style={[styles.fontButton, fontFamily === 'System' && styles.activeFontButton]}
                  onPress={() => handleFontFamilyChange('System')}
                >
                  <Text style={styles.fontButtonText}>System</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fontButton, fontFamily === 'serif' && styles.activeFontButton]}
                  onPress={() => handleFontFamilyChange('serif')}
                >
                  <Text style={styles.fontButtonText}>Serif</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fontButton, fontFamily === 'sans-serif' && styles.activeFontButton]}
                  onPress={() => handleFontFamilyChange('sans-serif')}
                >
                  <Text style={styles.fontButtonText}>Sans</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#fff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentText: {
    color: '#333',
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
    color: '#fff',
    fontSize: 20,
  },
  titleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: '60%',
    textAlign: 'center',
  },
  shareButton: {
    padding: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  bottomControls: {
    paddingBottom: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    color: '#fff',
    marginBottom: 5,
    fontSize: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  fontFamilyContainer: {
    marginTop: 20,
  },
  fontButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  fontButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFontButton: {
    backgroundColor: '#007AFF',
  },
  fontButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Reader;
