import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppIcon from './AppIcon';
import { useSettingsStore } from '@/store/settings';

interface SmartCollectionProps {
  collection: {
    id: string;
    name: string;
    apps: Array<{
      id: string;
      name: string;
      icon: string;
    }>;
  };
}

export default function SmartCollection({ collection }: SmartCollectionProps) {
  const theme = useSettingsStore((state) => state.theme);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{collection.name}</Text>
      <ScrollView horizontal>
        {collection.apps.map((app) => (
          <AppIcon key={app.id} app={app} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
});
