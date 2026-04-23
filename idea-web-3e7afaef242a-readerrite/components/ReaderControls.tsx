import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Slider,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReaderControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: 'light' | 'sepia' | 'dark';
  onThemeChange: (theme: 'light' | 'sepia' | 'dark') => void;
  marginSize: number;
  onMarginSizeChange: (size: number) => void;
  progress: number;
  onClose: () => void;
}

export default function ReaderControls({
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange,
  marginSize,
  onMarginSizeChange,
  progress,
  onClose
}: ReaderControlsProps) {
  const themeColors = {
    light: {
      background: '#ffffff',
      text: '#000000',
      controlBackground: '#f0f0f0',
      sliderTrack: '#d3d3d3',
      sliderThumb: '#007AFF',
    },
    sepia: {
      background: '#f4ecd8',
      text: '#5c4a3a',
      controlBackground: '#e8dcc8',
      sliderTrack: '#d3c3b3',
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

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons
            name="close"
            size={24}
            color={currentTheme.text}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.text }]}>Reading Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.controlSection, { backgroundColor: currentTheme.controlBackground }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Font Size</Text>
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, { color: currentTheme.text }]}>A</Text>
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
            <Text style={[styles.sliderLabel, { color: currentTheme.text }]}>A</Text>
          </View>
        </View>

        <View style={[styles.controlSection, { backgroundColor: currentTheme.controlBackground }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Theme</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'light' && styles.selectedTheme,
                { backgroundColor: '#ffffff', borderColor: currentTheme.text }
              ]}
              onPress={() => onThemeChange('light')}
            >
              <Text style={[styles.themeText, { color: '#000000' }]}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'sepia' && styles.selectedTheme,
                { backgroundColor: '#f4ecd8', borderColor: currentTheme.text }
              ]}
              onPress={() => onThemeChange('sepia')}
            >
              <Text style={[styles.themeText, { color: '#5c4a3a' }]}>Sepia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                theme === 'dark' && styles.selectedTheme,
                { backgroundColor: '#1a1a1a', borderColor: currentTheme.text }
              ]}
              onPress={() => onThemeChange('dark')}
            >
              <Text style={[styles.themeText, { color: '#e0e0e0' }]}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.controlSection, { backgroundColor: currentTheme.controlBackground }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Margins</Text>
          <View style={styles.sliderContainer}>
            <Text style={[styles.sliderLabel, { color: currentTheme.text }]}>Narrow</Text>
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
            <Text style={[styles.sliderLabel, { color: currentTheme.text }]}>Wide</Text>
          </View>
        </View>

        <View style={[styles.progressContainer, { backgroundColor: currentTheme.controlBackground }]}>
          <Text style={[styles.progressText, { color: currentTheme.text }]}>
            Progress: {progress.toFixed(0)}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: currentTheme.sliderThumb
                }
              ]}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 5,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  controlSection: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
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
  sliderLabel: {
    fontSize: 14,
    width: 30,
    textAlign: 'center',
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  themeOption: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedTheme: {
    borderWidth: 3,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
