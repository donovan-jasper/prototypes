import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { themes } from '../constants/themes';
import useAppStore from '../store/useAppStore';

const ThemePicker = () => {
  const { currentTheme, setTheme } = useAppStore();

  const handleThemeSelect = (theme: any) => {
    setTheme({ background: theme.background, text: theme.text });
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {themes.map((theme) => {
          const isSelected = currentTheme.background === theme.background;
          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                { backgroundColor: theme.background },
                isSelected && styles.selectedCard,
              ]}
              onPress={() => handleThemeSelect(theme)}
            >
              <View style={styles.themePreview}>
                <Text style={[styles.themeName, { color: theme.text }]}>
                  {theme.name}
                </Text>
                <View style={[styles.colorCircle, { backgroundColor: theme.text }]} />
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  themeCard: {
    width: 120,
    height: 140,
    borderRadius: 12,
    marginRight: 12,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#3498db',
  },
  themePreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3498db',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ThemePicker;
