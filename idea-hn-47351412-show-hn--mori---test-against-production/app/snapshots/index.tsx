import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSnapshotStore } from '../../lib/store/snapshots';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const SnapshotsScreen = () => {
  const { snapshots } = useSnapshotStore();
  const { theme } = useTheme();

  const handleNavigateToDiff = (id: string) => {
    // Navigate to schema diff screen
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={snapshots}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.snapshotItem} onPress={() => handleNavigateToDiff(item.id)}>
            <Text style={[styles.snapshotName, { color: theme.colors.text }]}>{item.name}</Text>
            <MaterialIcons name="arrow-forward" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <Link to="/snapshots/new" style={styles.createSnapshotButton}>
        <MaterialIcons name="add" size={24} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.primary }}>Create New Snapshot</Text>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  snapshotItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snapshotName: {
    fontSize: 16,
  },
  createSnapshotButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SnapshotsScreen;
