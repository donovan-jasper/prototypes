import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/appStore';
import AppIcon from '../../components/AppIcon';
import { getInstalledApps } from '../../lib/appManager';
import { switchMode } from '../../lib/modeEngine';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { activeMode, modes, setActiveMode, apps, setApps } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [filteredApps, setFilteredApps] = useState([]);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const installedApps = await getInstalledApps();
        setApps(installedApps);

        if (activeMode) {
          // Filter apps based on current mode
          const modeApps = installedApps.filter(app =>
            activeMode.appIds.includes(app.packageName)
          );
          setFilteredApps(modeApps);
        } else {
          setFilteredApps(installedApps);
        }
      } catch (error) {
        console.error('Error loading apps:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, [activeMode, setApps]);

  useEffect(() => {
    if (activeMode) {
      const modeApps = apps.filter(app =>
        activeMode.appIds.includes(app.packageName)
      );
      setFilteredApps(modeApps);
    } else {
      setFilteredApps(apps);
    }
  }, [activeMode, apps]);

  const handleModeSwitch = () => {
    navigation.navigate('modes');
  };

  const handleAppLongPress = (app) => {
    // Show context menu for app
    console.log('Long press on app:', app.label);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your apps...</Text>
      </View>
    );
  }

  if (!activeMode && modes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Welcome to FlowDeck</Text>
        <Text style={styles.emptySubtitle}>Create your first mode to get started</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('modes')}
        >
          <Text style={styles.createButtonText}>Create Mode</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.modeName}>
          {activeMode ? activeMode.name : 'All Apps'}
        </Text>
        <TouchableOpacity onPress={handleModeSwitch}>
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {filteredApps.length > 0 ? (
        <FlatList
          data={filteredApps}
          renderItem={({ item }) => (
            <AppIcon
              app={item}
              onLongPress={() => handleAppLongPress(item)}
            />
          )}
          keyExtractor={(item) => item.packageName}
          numColumns={4}
          contentContainerStyle={styles.grid}
        />
      ) : (
        <View style={styles.emptyAppsContainer}>
          <Text style={styles.emptyAppsText}>
            {activeMode
              ? 'No apps in this mode. Add some from the mode editor.'
              : 'No apps found. Please check your app permissions.'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modeName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  grid: {
    padding: 8,
  },
  emptyAppsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyAppsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
