import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl, ActivityIndicator } from 'react-native';
import SmartCollection from '@/components/SmartCollection';
import AppIcon from '@/components/AppIcon';
import SearchBar from '@/components/SearchBar';
import { useAppsStore } from '@/store/apps';
import { useSettingsStore } from '@/store/settings';
import { updateSmartCollections } from '@/lib/database';

export default function DrawerScreen() {
  const apps = useAppsStore((state) => state.apps);
  const collections = useAppsStore((state) => state.collections);
  const loadApps = useAppsStore((state) => state.loadApps);
  const loadCollections = useAppsStore((state) => state.loadCollections);
  const theme = useSettingsStore((state) => state.theme);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      await loadApps();
      await loadCollections();
      setIsLoading(false);
    };
    initializeData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await updateSmartCollections();
    await loadCollections();
    setRefreshing(false);
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SearchBar
        placeholder="Search apps..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {collections.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Smart Collections
            </Text>
            {collections.map((collection) => (
              <SmartCollection
                key={collection.id}
                collection={collection}
              />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            All Apps ({filteredApps.length})
          </Text>
          <View style={styles.appsGrid}>
            {filteredApps.map((app) => (
              <AppIcon key={app.id} app={app} size={60} />
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
  scrollContent: {
    paddingBottom: 20,
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
    justifyContent: 'space-between',
  },
});
