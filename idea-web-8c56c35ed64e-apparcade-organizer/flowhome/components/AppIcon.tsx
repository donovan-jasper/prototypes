import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSettingsStore } from '@/store/settings';
import { launchApp } from '@/lib/apps/launcher';

interface AppIconProps {
  app: {
    id: string;
    name: string;
    icon: string;
    packageName?: string;
  };
}

export default function AppIcon({ app }: AppIconProps) {
  const theme = useSettingsStore((state) => state.theme);

  const handlePress = () => {
    if (app.packageName) {
      launchApp(app.packageName);
    } else {
      console.warn(`No package name for app: ${app.name}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={[styles.container, { backgroundColor: theme.iconBackground }]}>
        <Image source={{ uri: app.icon }} style={styles.icon} />
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {app.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    margin: 5,
    width: 80,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  name: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
});
