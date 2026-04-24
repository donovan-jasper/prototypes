import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Linking, Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';

const { height } = Dimensions.get('window');

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const AppDrawer: React.FC<AppDrawerProps> = ({ visible, onClose }) => {
  const { currentTheme, currentMode } = useAppStore();
  const [installedApps, setInstalledApps] = React.useState<{ id: string; name: string; packageName: string }[]>([]);

  // Animation value
  const drawerTranslateY = useSharedValue(height);

  // Animated style
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drawerTranslateY.value }],
  }));

  // Update animation when visibility changes
  React.useEffect(() => {
    if (visible) {
      drawerTranslateY.value = withSpring(0, { damping: 20 });
      loadInstalledApps();
    } else {
      drawerTranslateY.value = withSpring(height, { damping: 20 });
    }
  }, [visible]);

  const loadInstalledApps = async () => {
    try {
      if (Platform.OS === 'android') {
        const apps = await Application.getInstalledApplicationsAsync();
        const filteredApps = apps
          .filter(app => app.packageName && app.name)
          .map(app => ({
            id: app.packageName,
            name: app.name,
            packageName: app.packageName
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setInstalledApps(filteredApps);
      } else if (Platform.OS === 'ios') {
        // iOS doesn't have a direct API for installed apps, so we'll use a fallback
        const commonApps = [
          { id: 'mail', name: 'Mail', packageName: 'message://' },
          { id: 'calendar', name: 'Calendar', packageName: 'calshow://' },
          { id: 'photos', name: 'Photos', packageName: 'photos-redirect://' },
          { id: 'camera', name: 'Camera', packageName: 'camera://' },
          { id: 'messages', name: 'Messages', packageName: 'sms://' },
          { id: 'maps', name: 'Maps', packageName: 'maps://' },
          { id: 'music', name: 'Music', packageName: 'music://' },
          { id: 'notes', name: 'Notes', packageName: 'mobilenotes://' },
        ];
        setInstalledApps(commonApps);
      }
    } catch (error) {
      console.error('Error loading installed apps:', error);
    }
  };

  const handleAppLaunch = async (app: { id: string; name: string; packageName: string }) => {
    try {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
          package: app.packageName,
          flags: [IntentLauncher.FLAG_ACTIVITY_NEW_TASK],
        });
      } else if (Platform.OS === 'ios') {
        await Linking.openURL(app.packageName);
      }
      onClose();
    } catch (error) {
      console.error('Error launching app:', error);
    }
  };

  // Filter apps based on current focus mode's allowedApps
  const filteredApps = currentMode?.allowedApps
    ? installedApps.filter(app => currentMode.allowedApps.includes(app.id))
    : installedApps;

  return (
    <Animated.View style={[styles.container, drawerStyle, { backgroundColor: currentTheme.drawerBackground }]}>
      <View style={styles.handle} />

      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appItem}
            onPress={() => handleAppLaunch(item)}
          >
            <Text style={[styles.appName, { color: currentTheme.text }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={[styles.closeButtonText, { color: currentTheme.text }]}>Close</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    zIndex: 100,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  appName: {
    fontSize: 16,
  },
  closeButton: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppDrawer;
