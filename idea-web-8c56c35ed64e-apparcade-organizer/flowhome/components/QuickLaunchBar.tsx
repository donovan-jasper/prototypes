import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import AppIcon from './AppIcon';
import { useSettingsStore } from '@/store/settings';
import { usePredictionsStore } from '@/store/predictions';
import { launchApp } from '@/lib/apps/launcher';
import { useAppsStore } from '@/store/apps';

export default function QuickLaunchBar() {
  const theme = useSettingsStore((state) => state.theme);
  const { predictedApps, loadPredictions } = usePredictionsStore();
  const { apps } = useAppsStore();
  const [scaleAnimations] = useState(predictedApps.map(() => new Animated.Value(1)));

  useEffect(() => {
    loadPredictions();
  }, []);

  const handleAppPress = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (app) {
      launchApp(app.id);
    }
  };

  const handleAppPressIn = (index: number) => {
    Animated.timing(scaleAnimations[index], {
      toValue: 0.9,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleAppPressOut = (index: number) => {
    Animated.timing(scaleAnimations[index], {
      toValue: 1,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
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
            <Animated.View style={{ transform: [{ scale: scaleAnimations[index] }] }}>
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
});
