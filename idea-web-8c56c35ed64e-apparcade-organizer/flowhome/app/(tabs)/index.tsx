import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import QuickLaunchBar from '@/components/QuickLaunchBar';
import { useAppsStore } from '@/store/apps';
import { usePredictionsStore } from '@/store/predictions';
import { useSettingsStore } from '@/store/settings';

export default function HomeScreen() {
  const apps = useAppsStore((state) => state.apps);
  const isLoading = useAppsStore((state) => state.isLoading);
  const loadApps = useAppsStore((state) => state.loadApps);
  const predictedApps = usePredictionsStore((state) => state.predictedApps);
  const loadPredictions = usePredictionsStore((state) => state.loadPredictions);
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    loadApps();
    loadPredictions();
  }, []);

  const filteredApps = apps.filter((app) => 
    predictedApps.includes(app.packageName)
  ).sort((a, b) => {
    const indexA = predictedApps.indexOf(a.packageName);
    const indexB = predictedApps.indexOf(b.packageName);
    return indexA - indexB;
  });

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
      <QuickLaunchBar apps={filteredApps} />
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
