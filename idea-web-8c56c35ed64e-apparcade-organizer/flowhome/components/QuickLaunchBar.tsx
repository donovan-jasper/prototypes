import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import AppIcon from './AppIcon';
import { useSettingsStore } from '@/store/settings';

interface QuickLaunchBarProps {
  apps: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

export default function QuickLaunchBar({ apps }: QuickLaunchBarProps) {
  const theme = useSettingsStore((state) => state.theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView horizontal>
        {apps.slice(0, 8).map((app) => (
          <AppIcon key={app.id} app={app} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});
