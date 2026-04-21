import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useSnapshotStore } from '../../lib/store/snapshots';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const CreateSnapshotScreen = () => {
  const { createSnapshot } = useSnapshotStore();
  const [name, setName] = useState('');
  const { theme } = useTheme();

  const handleCreateSnapshot = async () => {
    await createSnapshot(name);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Create New Snapshot</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.colors.primary }]}
        placeholder="Snapshot Name"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.createButton} onPress={handleCreateSnapshot}>
        <MaterialIcons name="add" size={24} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary }}>Create</Text>
      </TouchableOpacity>
      <Link to="/snapshots" style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary }}>Back</Text>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  createButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CreateSnapshotScreen;
