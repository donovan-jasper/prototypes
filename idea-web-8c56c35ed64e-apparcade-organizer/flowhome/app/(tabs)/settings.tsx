import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ThemePicker from '@/components/ThemePicker';
import { useSettingsStore } from '@/store/settings';

export default function SettingsScreen() {
  const themes = useSettingsStore((state) => state.themes);

  return (
    <View style={styles.container}>
      <ScrollView>
        <ThemePicker themes={themes} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
