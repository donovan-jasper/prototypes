import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Slider, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: 'light' | 'sepia' | 'dark';
  onThemeChange: (theme: 'light' | 'sepia' | 'dark') => void;
  marginSize: number;
  onMarginSizeChange: (size: number) => void;
  progress: number;
  onProgressChange: (progress: number) => void;
}

export default function ReaderControls({
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange,
  marginSize,
  onMarginSizeChange,
  progress,
  onProgressChange
}: ReaderControlsProps) {
  const themeColors = {
    light: '#000000',
    sepia: '#5c4a3a',
    dark: '#e0e0e0'
  };

  const currentColor = themeColors[theme];

  return (
    <View style={styles.container}>
      <View style={styles.controlGroup}>
        <Text style={[styles.label, { color: currentColor }]}>Font Size</Text>
        <View style={styles.sliderContainer}>
          <Text style={[styles.sliderValue, { color: currentColor }]}>A</Text>
          <Slider
            style={styles.slider}
            minimumValue={12}
            maximumValue={30}
            step={1}
            value={fontSize}
            onValueChange={onFontSizeChange}
            minimumTrackTintColor={currentColor}
            maximumTrackTintColor={currentColor}
            thumbTintColor={currentColor}
          />
          <Text style={[styles.sliderValue, { color: currentColor }]}>A</Text>
        </View>
      </View>

      <View style={styles.controlGroup}>
        <Text style={[styles.label, { color: currentColor }]}>Theme</Text>
        <View style={styles.themeButtons}>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === 'light' && styles.activeThemeButton,
              { borderColor: currentColor }
            ]}
            onPress={() => onThemeChange('light')}
          >
            <Text style={[styles.themeButtonText, { color: currentColor }]}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === 'sepia' && styles.activeThemeButton,
              { borderColor: currentColor }
            ]}
            onPress={() => onThemeChange('sepia')}
          >
            <Text style={[styles.themeButtonText, { color: currentColor }]}>Sepia</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeButton,
              theme === 'dark' && styles.activeThemeButton,
              { borderColor: currentColor }
            ]}
            onPress={() => onThemeChange('dark')}
          >
            <Text style={[styles.themeButtonText, { color: currentColor }]}>Dark</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controlGroup}>
        <Text style={[styles.label, { color: currentColor }]}>Margins</Text>
        <View style={styles.sliderContainer}>
          <Ionicons name="remove-outline" size={24} color={currentColor} />
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={40}
            step={1}
            value={marginSize}
            onValueChange={onMarginSizeChange}
            minimumTrackTintColor={currentColor}
            maximumTrackTintColor={currentColor}
            thumbTintColor={currentColor}
          />
          <Ionicons name="add-outline" size={24} color={currentColor} />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: currentColor }]}>
          {Math.round(progress)}%
        </Text>
        <Slider
          style={styles.progressSlider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={progress}
          onValueChange={onProgressChange}
          minimumTrackTintColor={currentColor}
          maximumTrackTintColor={currentColor}
          thumbTintColor={currentColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  controlGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeThemeButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  themeButtonText: {
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  progressSlider: {
    width: '100%',
  },
});
