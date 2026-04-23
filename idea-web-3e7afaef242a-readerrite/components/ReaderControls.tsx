import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Slider,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReaderControlsProps {
  visible: boolean;
  fontSize: number;
  theme: 'light' | 'sepia' | 'dark';
  marginSize: number;
  progress: number;
  totalChapters: number;
  currentChapter: number;
  onFontSizeChange: (size: number) => void;
  onThemeChange: (theme: 'light' | 'sepia' | 'dark') => void;
  onMarginSizeChange: (size: number) => void;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReaderControls({
  visible,
  fontSize,
  theme,
  marginSize,
  progress,
  totalChapters,
  currentChapter,
  onFontSizeChange,
  onThemeChange,
  onMarginSizeChange,
  onClose
}: ReaderControlsProps) {
  const [slideAnim] = useState(new Animated.Value(0));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const slideUp = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const themeColors = {
    light: {
      background: '#ffffff',
      text: '#000000',
      controlBackground: '#f5f5f5',
      sliderTrack: '#d3d3d3',
      sliderThumb: '#007AFF',
    },
    sepia: {
      background: '#f4ecd8',
      text: '#5c4a3a',
      controlBackground: '#e8dcc0',
      sliderTrack: '#c8b898',
      sliderThumb: '#8b6914',
    },
    dark: {
      background: '#1a1a1a',
      text: '#e0e0e0',
      controlBackground: '#2a2a2a',
      sliderTrack: '#4a4a4a',
      sliderThumb: '#4a9eff',
    }
  };

  const currentTheme = themeColors[theme];

  const handleThemeChange = (newTheme: 'light' | 'sepia' | 'dark') => {
    onThemeChange(newTheme);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideUp }],
          backgroundColor: currentTheme.background,
        }
      ]}
    >
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: currentTheme.text }]}>
          {Math.round(progress)}% complete
        </Text>
        <Text style={[styles.chapterText, { color: currentTheme.text }]}>
          Chapter {currentChapter + 1} of {totalChapters}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlGroup}>
          <Text style={[styles.controlLabel, { color: currentTheme.text }]}>Font Size</Text>
          <Slider
            style={styles.slider}
            minimumValue={12}
            maximumValue={30}
            step={1}
            value={fontSize}
            onValueChange={onFontSizeChange}
            minimumTrackTintColor={currentTheme.sliderThumb}
            maximumTrackTintColor={currentTheme.sliderTrack}
            thumbTintColor={currentTheme.sliderThumb}
          />
          <Text style={[styles.sliderValue, { color: currentTheme.text }]}>{fontSize}</Text>
        </View>

        <View style={styles.controlGroup}>
          <Text style={[styles.controlLabel, { color: currentTheme.text }]}>Theme</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === 'light' && styles.activeThemeButton,
                { backgroundColor: theme === 'light' ? '#ffffff' : currentTheme.controlBackground }
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Text style={[styles.themeButtonText, { color: theme === 'light' ? '#000000' : currentTheme.text }]}>
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === 'sepia' && styles.activeThemeButton,
                { backgroundColor: theme === 'sepia' ? '#f4ecd8' : currentTheme.controlBackground }
              ]}
              onPress={() => handleThemeChange('sepia')}
            >
              <Text style={[styles.themeButtonText, { color: theme === 'sepia' ? '#5c4a3a' : currentTheme.text }]}>
                Sepia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                theme === 'dark' && styles.activeThemeButton,
                { backgroundColor: theme === 'dark' ? '#1a1a1a' : currentTheme.controlBackground }
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Text style={[styles.themeButtonText, { color: theme === 'dark' ? '#ffffff' : currentTheme.text }]}>
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={[styles.advancedToggleText, { color: currentTheme.text }]}>
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Text>
          <Ionicons
            name={showAdvanced ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={currentTheme.text}
          />
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedControls}>
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: currentTheme.text }]}>Margins</Text>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={40}
                step={1}
                value={marginSize}
                onValueChange={onMarginSizeChange}
                minimumTrackTintColor={currentTheme.sliderThumb}
                maximumTrackTintColor={currentTheme.sliderTrack}
                thumbTintColor={currentTheme.sliderThumb}
              />
              <Text style={[styles.sliderValue, { color: currentTheme.text }]}>{marginSize}</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <Ionicons name="close" size={24} color={currentTheme.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chapterText: {
    fontSize: 14,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  controlGroup: {
    marginBottom: 20,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 14,
    textAlign: 'right',
    marginTop: 5,
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeThemeButton: {
    borderColor: '#007AFF',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  advancedToggleText: {
    fontSize: 14,
    marginRight: 5,
  },
  advancedControls: {
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
});
