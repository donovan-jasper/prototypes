import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AppIcon from './AppIcon';
import { useSettingsStore } from '@/store/settings';
import { useAppsStore } from '@/store/apps';
import { useNavigation } from '@react-navigation/native';

interface SmartCollectionProps {
  collection: {
    id: string;
    name: string;
    apps: string[];
  };
  onPress?: () => void;
}

export default function SmartCollection({ collection, onPress }: SmartCollectionProps) {
  const theme = useSettingsStore((state) => state.theme);
  const apps = useAppsStore((state) => state.apps);
  const navigation = useNavigation();

  // Filter apps to only those in this collection
  const collectionApps = apps.filter(app => collection.apps.includes(app.packageName));

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('CollectionDetail', { collectionId: collection.id });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.title, { color: theme.text }]}>{collection.name}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {collectionApps.map((app) => (
            <AppIcon key={app.id} app={app} size={60} />
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
});
