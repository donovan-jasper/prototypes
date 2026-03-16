import React from 'react';
import { View, StyleSheet } from 'react-native';
import QuickLaunchBar from '@/components/QuickLaunchBar';
import { useAppsStore } from '@/store/apps';

export default function HomeScreen() {
  const apps = useAppsStore((state) => state.apps);

  return (
    <View style={styles.container}>
      <QuickLaunchBar apps={apps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
