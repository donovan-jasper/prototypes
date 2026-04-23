import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useAppsStore } from '../../store/apps';
import { usePredictionsStore } from '../../store/predictions';
import SmartCollection from '../../components/SmartCollection';
import AppIcon from '../../components/AppIcon';
import { useTheme } from '../../lib/themes';
import { generateSmartCollections } from '../../lib/ml/patterns';

export default function DrawerScreen() {
  const { apps, loading: appsLoading, error: appsError, loadApps } = useAppsStore();
  const {
    smartCollections,
    loading: collectionsLoading,
    error: collectionsError,
    loadPredictions
  } = usePredictionsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadApps();
    loadPredictions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await generateSmartCollections();
      await loadPredictions();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (appsLoading || collectionsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (appsError || collectionsError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {appsError || collectionsError}
        </Text>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        style={[styles.searchInput, {
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderColor: theme.colors.border
        }]}
        placeholder="Search apps..."
        placeholderTextColor={theme.colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {searchQuery ? (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.appItem, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                // Handle app launch
                console.log('Launching app:', item.packageName);
              }}
            >
              <AppIcon icon={item.icon} size={40} />
              <Text style={[styles.appName, { color: theme.colors.text }]}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No apps found matching "{searchQuery}"
            </Text>
          }
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <FlatList
          data={smartCollections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SmartCollection
              id={item.id}
              name={item.name}
              apps={item.apps}
              onPress={() => {
                // Handle collection expansion
                console.log('Expanding collection:', item.id);
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No collections found. Try refreshing.
              </Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleRefresh}
              >
                <Text style={styles.refreshButtonText}>Refresh Collections</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  appName: {
    marginLeft: 12,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  refreshButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
});
