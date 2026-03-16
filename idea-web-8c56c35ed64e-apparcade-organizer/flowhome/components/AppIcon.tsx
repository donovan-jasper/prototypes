import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useSettingsStore } from '@/store/settings';

interface AppIconProps {
  app: {
    id: string;
    name: string;
    icon: string;
  };
}

export default function AppIcon({ app }: AppIconProps) {
  const theme = useSettingsStore((state) => state.theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.iconBackground }]}>
      <Image source={{ uri: app.icon }} style={styles.icon} />
      <Text style={[styles.name, { color: theme.text }]}>{app.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    margin: 5,
  },
  icon: {
    width: 50,
    height: 50,
  },
  name: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
});
