import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';

interface AppInfo {
  name: string;
  packageName: string;
}

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const AppDrawer: React.FC<AppDrawerProps> = ({ visible, onClose }) => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadApps();
    }
  }, [visible]);

  const loadApps = async () => {
    try {
      setLoading(true);
      let installedApps: AppInfo[] = [];

      if (Platform.OS === 'android') {
        // For Android, we can use expo-application to get installed apps
        const packageManager = await Application.getAndroidPackageManager();
        const packages = await packageManager.getInstalledPackages();

        installedApps = packages
          .map(pkg => ({
            name: pkg.applicationInfo?.loadLabel(packageManager) || pkg.packageName,
            packageName: pkg.packageName
          }))
          .filter(app => app.name && app.packageName)
          .sort((a, b) => a.name.localeCompare(b.name));
      } else if (Platform.OS === 'ios') {
        // For iOS, we'll use a predefined list since getting installed apps isn't straightforward
        installedApps = [
          { name: 'Calendar', packageName: 'calendar' },
          { name: 'Camera', packageName: 'camera' },
          { name: 'Clock', packageName: 'clock' },
          { name: 'Contacts', packageName: 'contacts' },
          { name: 'Files', packageName: 'files' },
          { name: 'Mail', packageName: 'mail' },
          { name: 'Maps', packageName: 'maps' },
          { name: 'Messages', packageName: 'messages' },
          { name: 'Music', packageName: 'music' },
          { name: 'Notes', packageName: 'notes' },
          { name: 'Phone', packageName: 'phone' },
          { name: 'Photos', packageName: 'photos' },
          { name: 'Settings', packageName: 'settings' },
          { name: 'Weather', packageName: 'weather' },
        ].sort((a, b) => a.name.localeCompare(b.name));
      }

      setApps(installedApps);
    } catch (error) {
      console.error('Error loading apps:', error);
      // Fallback to mock data if there's an error
      setApps([
        { name: 'Calendar', packageName: 'calendar' },
        { name: 'Camera', packageName: 'camera' },
        { name: 'Clock', packageName: 'clock' },
        { name: 'Contacts', packageName: 'contacts' },
        { name: 'Files', packageName: 'files' },
        { name: 'Mail', packageName: 'mail' },
        { name: 'Maps', packageName: 'maps' },
        { name: 'Messages', packageName: 'messages' },
        { name: 'Music', packageName: 'music' },
        { name: 'Notes', packageName: 'notes' },
        { name: 'Phone', packageName: 'phone' },
        { name: 'Photos', packageName: 'photos' },
        { name: 'Settings', packageName: 'settings' },
        { name: 'Weather', packageName: 'weather' },
      ].sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoading(false);
    }
  };

  const handleAppPress = async (app: AppInfo) => {
    try {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync(app.packageName);
      } else if (Platform.OS === 'ios') {
        // For iOS, we can use the URL scheme if available
        // This is a simplified approach - real implementation would need more work
        const url = `${app.packageName}://`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          console.log(`No URL scheme found for ${app.name}`);
        }
      }
      onClose();
    } catch (error) {
      console.error('Error launching app:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.title}>Apps</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading apps...</Text>
            </View>
          ) : (
            <FlatList
              data={apps}
              keyExtractor={(item) => item.packageName}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.appItem}
                  onPress={() => handleAppPress(item)}
                >
                  <Text style={styles.appName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text>No apps found</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  appItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appName: {
    fontSize: 18,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default AppDrawer;
