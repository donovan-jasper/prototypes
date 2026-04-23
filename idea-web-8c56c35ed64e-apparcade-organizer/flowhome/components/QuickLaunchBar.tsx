import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import AppIcon from './AppIcon';
import { useSettingsStore } from '@/store/settings';
import { usePredictionsStore } from '@/store/predictions';
import { launchApp } from '@/lib/apps/launcher';
import { useAppsStore } from '@/store/apps';
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

export default function QuickLaunchBar() {
  const theme = useSettingsStore((state) => state.theme);
  const { predictedApps, loadPredictions } = usePredictionsStore();
  const { apps } = useAppsStore();
  const [isLoading, setIsLoading] = useState(true);

  // Animation values for each app icon
  const scaleValues = predictedApps.map(() => useSharedValue(1));
  const opacityValues = predictedApps.map(() => useSharedValue(1));

  useEffect(() => {
    const loadData = async () => {
      await loadPredictions();
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAppPress = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (app) {
      launchApp(app.id);
    }
  };

  const handleAppPressIn = (index: number) => {
    scaleValues[index].value = withSpring(0.9, {
      damping: 10,
      stiffness: 300,
    });
  };

  const handleAppPressOut = (index: number) => {
    scaleValues[index].value = withSpring(1, {
      damping: 10,
      stiffness: 300,
    });
  };

  const getAnimatedStyle = (index: number) => {
    'worklet';
    return useAnimatedStyle(() => {
      return {
        transform: [{ scale: scaleValues[index].value }],
        opacity: opacityValues[index].value,
      };
    });
  };

  const getPredictedApps = () => {
    return predictedApps
      .map(id => apps.find(app => app.id === id))
      .filter(app => app !== undefined) as Array<{
        id: string;
        name: string;
        icon: string;
      }>;
  };

  const predictedAppsData = getPredictedApps();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.text} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {predictedAppsData.slice(0, 8).map((app, index) => (
          <TouchableOpacity
            key={app.id}
            onPress={() => handleAppPress(app.id)}
            onPressIn={() => handleAppPressIn(index)}
            onPressOut={() => handleAppPressOut(index)}
            activeOpacity={0.7}
            style={styles.iconContainer}
          >
            <Animated.View style={getAnimatedStyle(index)}>
              <AppIcon app={app} />
            </Animated.View>
          </TouchableOpacity>
        ))}
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    zIndex: 100,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  iconContainer: {
    marginHorizontal: 8,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
