import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Slider, Platform } from 'react-native';
import { useLibraryStore } from '../store/useLibraryStore';
import { Ionicons } from '@expo/vector-icons';

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
    currentBook
  } = useLibraryStore();

  const themes = ['light', 'sepia', 'dark'] as const;

  const handleThemeChange = (newTheme: typeof themes[number]) => {
    setTheme(newTheme);
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Font Size: {fontSize}</Text>
          <Slider
            style={styles.slider}
            minimumValue={12}
            maximumValue={30}
            step={1}
            value={fontSize}
            onValueChange={setFontSize}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#007AFF"
          />
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.label}>Theme</Text>
          <View style={styles.themeSelector}>
            {themes.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.themeButton,
                  theme === t && styles.activeThemeButton,
                  t === 'light' && styles.lightTheme,
                  t === 'sepia' && styles.sepiaTheme,
                  t === 'dark' && styles.darkTheme
                ]}
                onPress={() => handleThemeChange(t)}
              >
                <Text style={[
                  styles.themeButtonText,
                  theme === t && styles.activeThemeButtonText
                ]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.label}>Margins: {marginSize}</Text>
          <Slider
            style={styles.slider}
            minimumValue={8}
            maximumValue={32}
            step={1}
            value={marginSize}
            onValueChange={setMarginSize}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#007AFF"
          />
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentBook?.currentPage || 0} / {currentBook?.totalPages || 0}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  controlsContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  controlGroup: {
    marginBottom: 8,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  activeThemeButton: {
    borderWidth: 2,
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
    color: '#333333',
  },
  activeThemeButtonText: {
    color: '#007AFF',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  progressText: {
    color: 'white',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
  },
});
