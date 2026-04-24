import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { getBlockedApps, addBlockedApp, removeBlockedApp } from '../services/distractionBlocker';

const DistractionBlockerSettings: React.FC = () => {
  const [blockedApps, setBlockedApps] = useState(getBlockedApps());
  const [newAppPackage, setNewAppPackage] = useState('');

  const handleAddApp = () => {
    if (newAppPackage.trim()) {
      addBlockedApp(newAppPackage.trim());
      setBlockedApps([...getBlockedApps()]);
      setNewAppPackage('');
    }
  };

  const handleRemoveApp = (packageName: string) => {
    removeBlockedApp(packageName);
    setBlockedApps([...getBlockedApps()]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blocked Apps</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter app package name"
          value={newAppPackage}
          onChangeText={setNewAppPackage}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddApp}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={blockedApps}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.appItem}>
            <Text style={styles.appText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveApp(item)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appText: {
    fontSize: 16,
  },
  removeText: {
    color: 'red',
  },
});

export default DistractionBlockerSettings;
