import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import * as Application from 'expo-application';

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

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = () => {
    const mockApps: AppInfo[] = [
      { name: 'Calendar', packageName: 'com.calendar' },
      { name: 'Camera', packageName: 'com.camera' },
      { name: 'Clock', packageName: 'com.clock' },
      { name: 'Contacts', packageName: 'com.contacts' },
      { name: 'Files', packageName: 'com.files' },
      { name: 'Gallery', packageName: 'com.gallery' },
      { name: 'Mail', packageName: 'com.mail' },
      { name: 'Maps', packageName: 'com.maps' },
      { name: 'Messages', packageName: 'com.messages' },
      { name: 'Music', packageName: 'com.music' },
      { name: 'Notes', packageName: 'com.notes' },
      { name: 'Phone', packageName: 'com.phone' },
      { name: 'Photos', packageName: 'com.photos' },
      { name: 'Settings', packageName: 'com.settings' },
      { name: 'Weather', packageName: 'com.weather' },
    ].sort((a, b) => a.name.localeCompare(b.name));

    setApps(mockApps);
  };

  const handleAppPress = (app: AppInfo) => {
    console.log('Opening app:', app.name);
    onClose();
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
          />
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
});

export default AppDrawer;
