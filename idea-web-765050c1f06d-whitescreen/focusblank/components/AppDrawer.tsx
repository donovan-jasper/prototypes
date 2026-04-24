import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal, Platform, ActivityIndicator } from 'react-native';
import * as Application from 'expo-application';
import AppLauncher from './AppLauncher';

interface AppInfo {
  name: string;
  packageName: string;
  icon?: string;
  fallbackUrl?: string;
}

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  allowedApps?: string[];
}

const AppDrawer: React.FC<AppDrawerProps> = ({ visible, onClose, allowedApps }) => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadApps();
    }
  }, [visible]);

  const loadApps = async () => {
    try {
      setLoading(true);
      setError(null);
      let installedApps: AppInfo[] = [];

      if (Platform.OS === 'android') {
        // For Android, get installed apps
        const packageManager = await Application.getAndroidPackageManager();
        const packages = await packageManager.getInstalledPackages();

        installedApps = packages
          .map(pkg => ({
            name: pkg.applicationInfo?.loadLabel(packageManager) || pkg.packageName,
            packageName: pkg.packageName,
            icon: pkg.applicationInfo?.loadIcon(packageManager),
          }))
          .filter(app => app.name && app.packageName)
          .sort((a, b) => a.name.localeCompare(b.name));
      } else if (Platform.OS === 'ios') {
        // For iOS, use predefined list with URL schemes and App Store links
        installedApps = [
          { name: 'Calendar', packageName: 'calshow', fallbackUrl: 'https://apps.apple.com/app/calendar/id338205905' },
          { name: 'Camera', packageName: 'camera', fallbackUrl: 'https://apps.apple.com/app/camera/id344685569' },
          { name: 'Clock', packageName: 'clock', fallbackUrl: 'https://apps.apple.com/app/clock/id304275544' },
          { name: 'Contacts', packageName: 'contacts', fallbackUrl: 'https://apps.apple.com/app/contacts/id368677889' },
          { name: 'Files', packageName: 'shareddocuments', fallbackUrl: 'https://apps.apple.com/app/files/id364721887' },
          { name: 'Mail', packageName: 'message', fallbackUrl: 'https://apps.apple.com/app/mail/id1108187098' },
          { name: 'Maps', packageName: 'maps', fallbackUrl: 'https://apps.apple.com/app/maps/id915056765' },
          { name: 'Messages', packageName: 'sms', fallbackUrl: 'https://apps.apple.com/app/messages/id386796243' },
          { name: 'Music', packageName: 'music', fallbackUrl: 'https://apps.apple.com/app/music/id1108187170' },
          { name: 'Notes', packageName: 'mobilenotes', fallbackUrl: 'https://apps.apple.com/app/notes/id1108187220' },
          { name: 'Phone', packageName: 'tel', fallbackUrl: 'https://apps.apple.com/app/phone/id364709193' },
          { name: 'Photos', packageName: 'photos-redirect', fallbackUrl: 'https://apps.apple.com/app/photos/id364721887' },
          { name: 'Settings', packageName: 'App-Prefs', fallbackUrl: 'https://apps.apple.com/app/settings/id1550868983' },
          { name: 'Weather', packageName: 'weather', fallbackUrl: 'https://apps.apple.com/app/weather/id519186602' },
        ].sort((a, b) => a.name.localeCompare(b.name));
      }

      // Filter by allowed apps if specified
      if (allowedApps && allowedApps.length > 0) {
        installedApps = installedApps.filter(app =>
          allowedApps.includes(app.packageName) ||
          allowedApps.includes(app.name.toLowerCase())
        );
      }

      setApps(installedApps);
    } catch (error) {
      console.error('Error loading apps:', error);
      setError('Failed to load apps. Please try again.');
      // Fallback to basic apps if there's an error
      setApps([
        { name: 'Calendar', packageName: 'calendar', fallbackUrl: 'https://apps.apple.com/app/calendar/id338205905' },
        { name: 'Camera', packageName: 'camera', fallbackUrl: 'https://apps.apple.com/app/camera/id344685569' },
        { name: 'Clock', packageName: 'clock', fallbackUrl: 'https://apps.apple.com/app/clock/id304275544' },
        { name: 'Contacts', packageName: 'contacts', fallbackUrl: 'https://apps.apple.com/app/contacts/id368677889' },
        { name: 'Files', packageName: 'files', fallbackUrl: 'https://apps.apple.com/app/files/id364721887' },
        { name: 'Mail', packageName: 'mail', fallbackUrl: 'https://apps.apple.com/app/mail/id1108187098' },
        { name: 'Maps', packageName: 'maps', fallbackUrl: 'https://apps.apple.com/app/maps/id915056765' },
        { name: 'Messages', packageName: 'messages', fallbackUrl: 'https://apps.apple.com/app/messages/id386796243' },
        { name: 'Music', packageName: 'music', fallbackUrl: 'https://apps.apple.com/app/music/id1108187170' },
        { name: 'Notes', packageName: 'notes', fallbackUrl: 'https://apps.apple.com/app/notes/id1108187220' },
        { name: 'Phone', packageName: 'phone', fallbackUrl: 'https://apps.apple.com/app/phone/id364709193' },
        { name: 'Photos', packageName: 'photos', fallbackUrl: 'https://apps.apple.com/app/photos/id364721887' },
        { name: 'Settings', packageName: 'settings', fallbackUrl: 'https://apps.apple.com/app/settings/id1550868983' },
        { name: 'Weather', packageName: 'weather', fallbackUrl: 'https://apps.apple.com/app/weather/id519186602' },
      ].sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoading(false);
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
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading apps...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadApps} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : apps.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No apps available</Text>
            </View>
          ) : (
            <FlatList
              data={apps}
              keyExtractor={(item) => item.packageName}
              renderItem={({ item }) => (
                <AppLauncher
                  packageName={item.packageName}
                  fallbackUrl={item.fallbackUrl}
                >
                  <View style={styles.appItem}>
                    {item.icon && Platform.OS === 'android' ? (
                      <Image source={{ uri: item.icon }} style={styles.appIcon} />
                    ) : (
                      <View style={styles.appIconPlaceholder} />
                    )}
                    <Text style={styles.appName}>{item.name}</Text>
                  </View>
                </AppLauncher>
              )}
              contentContainerStyle={styles.listContent}
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
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  appIconPlaceholder: {
    width: 24,
    height: 24,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  appName: {
    fontSize: 16,
  },
});

export default AppDrawer;
