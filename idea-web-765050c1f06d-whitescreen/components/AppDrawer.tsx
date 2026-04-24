import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';

const { height } = Dimensions.get('window');

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
  allowedApps?: string[];
}

const AppDrawer: React.FC<AppDrawerProps> = ({ visible, onClose, allowedApps }) => {
  const { currentTheme } = useAppStore();

  // Mock app data - in a real app this would come from the device's installed apps
  const apps = [
    { id: '1', name: 'Mail', icon: 'mail' },
    { id: '2', name: 'Calendar', icon: 'calendar' },
    { id: '3', name: 'Notes', icon: 'notes' },
    { id: '4', name: 'Camera', icon: 'camera' },
    { id: '5', name: 'Photos', icon: 'photos' },
    { id: '6', name: 'Messages', icon: 'messages' },
    { id: '7', name: 'Maps', icon: 'maps' },
    { id: '8', name: 'Music', icon: 'music' },
  ];

  const filteredApps = allowedApps
    ? apps.filter(app => allowedApps.includes(app.id))
    : apps;

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.drawerBackground }]}>
      <View style={styles.handle} />

      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.appItem} onPress={onClose}>
            <Text style={[styles.appName, { color: currentTheme.text }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={[styles.closeButtonText, { color: currentTheme.text }]}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
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
