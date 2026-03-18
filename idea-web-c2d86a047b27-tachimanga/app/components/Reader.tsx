import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getContent, saveReadingProgress, getReadingProgress } from '../utils/offlineLibrary';

const Reader = ({ route }: any) => {
  const { contentId } = route.params;
  const [content, setContent] = useState<any>(null);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('System');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadContent = async () => {
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
    };
    loadContent();

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [contentId]);

  const calculatePercentage = (scrollY: number) => {
    if (contentHeight <= scrollViewHeight) return 100;
    const maxScroll = contentHeight - scrollViewHeight;
    return Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
  };

  const handleScroll = (event: any) => {
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
  };

  const handleShareProgress = async () => {
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
  };

  if (!content) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const currentPercentage = calculatePercentage(scrollPosition);

  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${currentPercentage}%` }]} />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(currentPercentage)}%</Text>
        </View>
        <TouchableOpacity onPress={handleShareProgress} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Progress</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        <Text style={[styles.text, { fontSize, fontFamily }]}>{content.text}</Text>
      </ScrollView>
      
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))} style={styles.controlButton}>
          <Text style={styles.controlText}>A-</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFontSize(Math.min(32, fontSize + 2))} style={styles.controlButton}>
          <Text style={styles.controlText}>A+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFontFamily('System')} style={styles.controlButton}>
          <Text style={[styles.controlText, fontFamily === 'System' && styles.activeControl]}>System</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFontFamily('monospace')} style={styles.controlButton}>
          <Text style={[styles.controlText, fontFamily === 'monospace' && styles.activeControl]}>Mono</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressHeader: {
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 45,
    textAlign: 'right',
  },
  shareButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    padding: 20,
  },
  text: {
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  controlText: {
    fontSize: 16,
    color: '#333',
  },
  activeControl: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default Reader;
