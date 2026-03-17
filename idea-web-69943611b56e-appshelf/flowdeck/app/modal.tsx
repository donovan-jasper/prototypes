import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, SafeAreaView, ScrollView } from 'react-native';
import { useStore } from '../store/appStore';
import { useApps } from '../hooks/useApps';
import { saveMode } from '../lib/database';
import { Picker } from '@react-native-picker/picker';

const ModalScreen = ({ route, navigation }) => {
  const { mode } = route?.params || {};
  const { addMode } = useStore();
  const { apps } = useApps();
  const [name, setName] = useState(mode?.name || '');
  const [color, setColor] = useState(mode?.color || '#6200EE');
  const [selectedApps, setSelectedApps] = useState(new Set(mode?.appIds || []));
  const [searchQuery, setSearchQuery] = useState('');
  
  const colors = [
    '#6200EE', '#03DAC6', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];

  const filteredApps = apps.filter(app =>
    app.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAppSelection = (packageName) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(packageName)) {
      newSelected.delete(packageName);
    } else {
      newSelected.add(packageName);
    }
    setSelectedApps(newSelected);
  };

  const handleSave = async () => {
    const newMode = {
      id: mode?.id || Date.now().toString(),
      name,
      color,
      appIds: Array.from(selectedApps),
      createdAt: new Date().toISOString()
    };
    
    await saveMode(newMode);
    addMode(newMode);
    navigation.goBack();
  };

  return (
    <Modal visible={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{mode ? 'Edit Mode' : 'Create Mode'}</Text>
            <TouchableOpacity onPress={handleSave} disabled={!name.trim()}>
              <Text style={[styles.saveButton, !name.trim() && styles.disabledSave]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Mode Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter mode name"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorPickerContainer}>
              <Picker
                selectedValue={color}
                onValueChange={setColor}
                style={styles.colorPicker}
              >
                {colors.map((c) => (
                  <Picker.Item key={c} label="" value={c} />
                ))}
              </Picker>
              <View style={[styles.colorPreview, { backgroundColor: color }]} />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Search Apps</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search apps..."
            />
          </View>

          <View style={styles.appsSection}>
            <Text style={styles.appsLabel}>
              Selected Apps ({selectedApps.size})
            </Text>
            <FlatList
              data={filteredApps}
              keyExtractor={(item) => item.packageName}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.appItem,
                    selectedApps.has(item.packageName) && styles.selectedAppItem
                  ]}
                  onPress={() => toggleAppSelection(item.packageName)}
                >
                  <Text style={styles.appLabel}>{item.label}</Text>
                  {selectedApps.has(item.packageName) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledSave: {
    color: '#ccc',
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPicker: {
    flex: 1,
    height: 50,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  appsSection: {
    flex: 1,
  },
  appsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedAppItem: {
    backgroundColor: '#f0f8ff',
  },
  appLabel: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
  },
});

export default ModalScreen;
