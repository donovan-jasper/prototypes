import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AppIcon from './AppIcon';
import { useAppsStore } from '../store/apps';
import { useTheme } from '../lib/themes';

interface SmartCollectionProps {
  id: string;
  name: string;
  apps: string[];
  onPress?: () => void;
}

const SmartCollection: React.FC<SmartCollectionProps> = ({ id, name, apps, onPress }) => {
  const { apps: allApps } = useAppsStore();
  const theme = useTheme();

  // Get app details for the collection
  const collectionApps = apps
    .map(pkg => allApps.find(app => app.packageName === pkg))
    .filter(Boolean) as Array<{
      id: string;
      name: string;
      packageName: string;
      icon?: string;
    }>;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity onPress={onPress}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{name}</Text>
      </TouchableOpacity>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={collectionApps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appItem}
            onPress={() => {
              // Handle app launch
              console.log('Launching app:', item.packageName);
            }}
          >
            <AppIcon icon={item.icon} size={48} />
            <Text style={[styles.appName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
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
  },
  listContent: {
    paddingVertical: 8,
  },
  appItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  appName: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SmartCollection;
