import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApps } from '../../hooks/useApps';
import { useModes } from '../../hooks/useModes';
import AppIcon from '../../components/AppIcon';
import { useAppStore } from '../../store/appStore';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { apps, loadApps, isLoading } = useApps();
  const { modes, loadModes } = useModes();
  const { activeMode, setActiveMode } = useAppStore();
  const [displayedApps, setDisplayedApps] = useState([]);

  useEffect(() => {
    loadApps();
    loadModes();
  }, []);

  useEffect(() => {
    if (activeMode && apps.length > 0) {
      // Filter apps based on the current mode
      const filteredApps = apps.filter(app =>
        activeMode.appIds.includes(app.packageName)
      );
      setDisplayedApps(filteredApps);
    } else if (apps.length > 0) {
      // If no active mode, show all apps
      setDisplayedApps(apps);
    }
  }, [activeMode, apps]);

  const handleModePress = () => {
    navigation.navigate('modes');
  };

  const handleAppLongPress = (app) => {
    // Show app options (remove from mode, app info, etc.)
    console.log('Long press on app:', app.label);
  };

  const renderAppItem = ({ item }) => (
    <AppIcon
      app={item}
      onLongPress={() => handleAppLongPress(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeMode ? activeMode.name : 'All Apps'}
        </Text>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={handleModePress}
        >
          <Text style={styles.modeButtonText}>Modes</Text>
          <MaterialIcons name="keyboard-arrow-right" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading apps...</Text>
        </View>
      ) : displayedApps.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeMode
              ? 'No apps in this mode. Add some from the Modes screen.'
              : 'No apps found. Please check your permissions.'}
          </Text>
          {Platform.OS === 'ios' && (
            <Text style={styles.iosNote}>
              Note: iOS doesn't allow listing installed apps. You can create curated modes.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={displayedApps}
          renderItem={renderAppItem}
          keyExtractor={(item) => item.packageName}
          numColumns={4}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
    color: '#666',
    marginRight: 4,
  },
  grid: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  iosNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;
