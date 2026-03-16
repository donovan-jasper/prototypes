import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import FocusModeCard from '@/components/FocusModeCard';
import { useSettingsStore } from '@/store/settings';

export default function FocusScreen() {
  const focusModes = useSettingsStore((state) => state.focusModes);

  return (
    <View style={styles.container}>
      <ScrollView>
        {focusModes.map((mode) => (
          <FocusModeCard key={mode.id} mode={mode} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
