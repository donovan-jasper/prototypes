import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Slider from '@react-native-community/slider';

interface ReaderControlsProps {
  visible: boolean;
  fontSize: number;
  theme: 'light' | 'sepia' | 'dark';
  progress: number;
  totalChapters: number;
  currentChapter: number;
  onFontSizeChange: (size: number) => void;
  onThemeChange: (theme: 'light' | 'sepia' | 'dark') => void;
  onClose: () => void;
}

export default function ReaderControls({
  visible,
  fontSize,
  theme,
  progress,
  totalChapters,
  currentChapter,
  onFontSizeChange,
  onThemeChange,
  onClose
}: ReaderControlsProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <View style={styles.controlPanel}>
        <View style={styles.section}>
          <Text style={styles.label}>Font Size</Text>
          <View style={styles.fontSizeControl}>
            <TouchableOpacity
              style={styles.fontButton}
              onPress={() => onFontSizeChange(Math.max(12, fontSize - 2))}
            >
              <Text style={styles.fontButtonText}>A-</Text>
            </TouchableOpacity>
            <Text style={styles.fontSizeValue}>{fontSize}px</Text>
            <TouchableOpacity
              style={styles.fontButton}
              onPress={() => onFontSizeChange(Math.min(32, fontSize + 2))}
            >
              <Text style={styles.fontButtonText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Theme</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                styles.lightTheme,
                theme === 'light' && styles.themeButtonActive
              ]}
              onPress={() => onThemeChange('light')}
            >
              <Text style={styles.themeButtonText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                styles.sepiaTheme,
                theme === 'sepia' && styles.themeButtonActive
              ]}
              onPress={() => onThemeChange('sepia')}
            >
              <Text style={styles.themeButtonText}>Sepia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                styles.darkTheme,
                theme === 'dark' && styles.themeButtonActive
              ]}
              onPress={() => onThemeChange('dark')}
            >
              <Text style={[styles.themeButtonText, styles.darkThemeText]}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Progress: Chapter {currentChapter + 1} of {totalChapters}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  fontSizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  fontButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  fontSizeValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    minWidth: 60,
    textAlign: 'center',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeButtonActive: {
    borderColor: '#007AFF',
  },
  lightTheme: {
    backgroundColor: '#ffffff',
  },
  sepiaTheme: {
    backgroundColor: '#f4ecd8',
  },
  darkTheme: {
    backgroundColor: '#1a1a1a',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  darkThemeText: {
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  }
});
