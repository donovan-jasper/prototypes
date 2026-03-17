import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl } from 'react-native';
import SmartCollection from '@/components/SmartCollection';
import AppIcon from '@/components/AppIcon';
import { useAppsStore } from '@/store/apps';
import { useSettingsStore } from '@/store/settings';

export default function DrawerScreen() {
  const apps = useAppsStore((state) => state.apps);
  const collections = useAppsStore((state) => state.collections);
  const loadApps = useAppsStore((state) => state.loadApps);
  const loadCollections = useAppsStore((state) => state.loadCollections);
  const theme = useSettingsStore((state) => state.theme);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadApps();
    loadCollections();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApps();
    await loadCollections();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {collections.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Smart Collections
            </Text>
            {collections.map((collection) => (
              <SmartCollection key={collection.id} collection={collection} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            All Apps ({apps.length})
          </Text>
          <View style={styles.appsGrid}>
            {apps.map((app) => (
              <AppIcon key={app.id} app={app} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
});
