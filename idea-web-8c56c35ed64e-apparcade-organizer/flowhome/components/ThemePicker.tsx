import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSettingsStore } from '@/store/settings';

interface ThemePickerProps {
  themes: Array<{
    id: string;
    name: string;
    isPremium: boolean;
  }>;
}

export default function ThemePicker({ themes }: ThemePickerProps) {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <View style={styles.container}>
      {themes.map((themeItem) => (
        <TouchableOpacity
          key={themeItem.id}
          style={[
            styles.themeItem,
            { backgroundColor: theme.cardBackground },
            theme.id === themeItem.id && styles.selectedTheme,
          ]}
          onPress={() => setTheme(themeItem.id)}
        >
          <Text style={[styles.themeName, { color: theme.text }]}>{themeItem.name}</Text>
          {themeItem.isPremium && <Text style={styles.premiumTag}>Premium</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  themeItem: {
    width: '48%',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  themeName: {
    fontSize: 16,
  },
  premiumTag: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 5,
  },
});
