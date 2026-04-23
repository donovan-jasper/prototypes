import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView } from 'react-native';
import { useAppsStore } from '@/store/apps';
import QuickLaunchBar from '@/components/QuickLaunchBar';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePredictionsStore } from '@/store/predictions';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { apps, isLoading, error, loadApps } = useAppsStore();
  const { loadPredictions } = usePredictionsStore();

  useEffect(() => {
    if (apps.length === 0 && !isLoading && !error) {
      loadApps();
    }
    loadPredictions();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Learning your app patterns...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ErrorMessage
          message={error}
          onRetry={loadApps}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          FlowHome
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Your apps, exactly when you need them
        </Text>
      </View>
      <QuickLaunchBar />
    </SafeAreaView>
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
  },
});
