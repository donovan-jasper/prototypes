import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Slider, Platform } from 'react-native';
import { useLibraryStore } from '../store/useLibraryStore';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

interface ReaderControlsProps {
  onClose: () => void;
}

export default function ReaderControls({ onClose }: ReaderControlsProps) {
  const {
    fontSize,
    setFontSize,
    theme,
    setTheme,
    marginSize,
    setMarginSize,
    currentBook,
  } = useLibraryStore();

  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localMarginSize, setLocalMarginSize] = useState(marginSize);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Auto-hide controls after 3 seconds of inactivity
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleFontSizeChange = (value: number) => {
    setLocalFontSize(value);
    setFontSize(value);
  };

  const handleMarginSizeChange = (value: number) => {
    setLocalMarginSize(value);
    setMarginSize(value);
  };

  const handleThemeChange = (newTheme: 'light' | 'sepia' | 'dark') => {
    setTheme(newTheme);
  };

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return 'sunny-outline';
      case 'sepia':
        return 'leaf-outline';
      case 'dark':
        return 'moon-outline';
      default:
        return 'color-palette-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        {/* Font Size Control */}
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Font Size</Text>
          <View style={styles.sliderContainer}>
            <Ionicons name="text-outline" size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <Slider
              style={styles.slider}
              minimumValue={12}
              maximumValue={24}
              step={1}
              value={localFontSize}
              onValueChange={setLocalFontSize}
              onSlidingComplete={handleFontSizeChange}
              minimumTrackTintColor="#4a9eff"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#4a9eff"
            />
            <Ionicons name="text-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          </View>
        </View>

        {/* Margin Size Control */}
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Margins</Text>
          <View style={styles.sliderContainer}>
            <Ionicons name="expand-outline" size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <Slider
              style={styles.slider}
              minimumValue={8}
              maximumValue={32}
              step={1}
              value={localMarginSize}
              onValueChange={setLocalMarginSize}
              onSlidingComplete={handleMarginSizeChange}
              minimumTrackTintColor="#4a9eff"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#4a9eff"
            />
            <Ionicons name="expand-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          </View>
        </View>

        {/* Theme Selector */}
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Theme</Text>
          <View style={styles.themeSelector}>
            {(['light', 'sepia', 'dark'] as const).map((themeOption) => (
              <TouchableOpacity
                key={themeOption}
                style={[
                  styles.themeButton,
                  theme === themeOption && styles.activeThemeButton,
                ]}
                onPress={() => handleThemeChange(themeOption)}
              >
                <Ionicons
                  name={getThemeIcon(themeOption)}
                  size={24}
                  color={theme === themeOption ? '#4a9eff' : (colorScheme === 'dark' ? '#fff' : '#000')}
                />
                <Text style={[
                  styles.themeButtonText,
                  theme === themeOption && styles.activeThemeButtonText,
                ]}>
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Progress Indicator */}
        {currentBook && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentBook.currentPage + 1} of {currentBook.totalPages || '?'}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: currentBook.totalPages
                      ? `${(currentBook.currentPage / currentBook.totalPages) * 100}%`
                      : '0%',
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
  },
  controlsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  controlGroup: {
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  activeThemeButton: {
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
  },
  themeButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  activeThemeButtonText: {
    color: '#4a9eff',
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a9eff',
    borderRadius: 2,
  },
});
