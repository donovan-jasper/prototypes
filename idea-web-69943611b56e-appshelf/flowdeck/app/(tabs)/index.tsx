import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import { useStore } from '../../store/appStore';
import AppIcon from '../../components/AppIcon';
import { useApps } from '../../hooks/useApps';
import { useModes } from '../../hooks/useModes';
import * as IntentLauncher from 'expo-intent-launcher';

const HomeScreen = () => {
  const { activeMode } = useStore();
  const { apps, loading, error } = useApps();
  const { modes } = useModes();
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 30) {
      setPermissionGranted(false);
    } else {
      setPermissionGranted(true);
    }
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.MANAGE_ALL_APPLICATIONS_SETTINGS
        );
        Alert.alert(
          'Permission Required',
          'Please enable "Allow access to all apps" for FlowDeck in the settings.',
          [{ text: 'OK', onPress: () => setPermissionGranted(true) }]
        );
      } catch (e) {
        console.error('Error opening settings:', e);
      }
    }
  };

  if (Platform.OS === 'android' && Platform.Version >= 30 && !permissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Permission Required</Text>
        <Text style={styles.permissionText}>
          FlowDeck needs permission to access your installed apps to organize them into modes.
        </Text>
        <Text style={styles.permissionSubtext}>
          This is required on Android 11+ to list installed applications.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading apps...</Text>
      </View>
    );
  }

  const filteredApps = activeMode 
    ? apps.filter(app => activeMode.appIds.includes(app.packageName))
    : apps;

  if (!activeMode) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Welcome to FlowDeck</Text>
        <Text style={styles.emptyText}>Create your first mode to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.modeTitle}>{activeMode.name}</Text>
        <Text style={styles.appCount}>{filteredApps.length} apps</Text>
      </View>
      <FlatList
        data={filteredApps}
        renderItem={({ item }) => <AppIcon app={item} />}
        keyExtractor={item => item.packageName}
        numColumns={4}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  grid: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  permissionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
