import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import QuickLaunchBar from '@/components/QuickLaunchBar';
import { useAppsStore } from '@/store/apps';
import { useSettingsStore } from '@/store/settings';

export default function HomeScreen() {
  const apps = useAppsStore((state) => state.apps);
  const isLoading = useAppsStore((state) => state.isLoading);
  const loadApps = useAppsStore((state) => state.loadApps);
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    loadApps();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>FlowHome</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.text} />
        ) : apps.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No apps found. Pull down to refresh.
          </Text>
        ) : null}
      </View>
      <QuickLaunchBar apps={apps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
