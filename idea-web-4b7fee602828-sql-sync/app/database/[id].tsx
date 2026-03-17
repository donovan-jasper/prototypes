import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { queryRows, deleteRow } from '../../lib/db';
import RowList from '../../components/RowList';

const DatabaseScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { databases } = useStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const database = databases.find(db => db.id === id);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const results = await queryRows(id, 'SELECT * FROM rows');
        setRows(results);
      } catch (error) {
        console.error('Error fetching rows:', error);
        Alert.alert('Error', 'Failed to load rows');
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, [id]);

  const handleDeleteRow = async (rowId) => {
    try {
      await deleteRow(id, rowId);
      setRows(rows.filter(row => row.id !== rowId));
    } catch (error) {
      console.error('Error deleting row:', error);
      Alert.alert('Error', 'Failed to delete row');
    }
  };

  const handleAddRow = () => {
    router.push(`/row/new?dbId=${id}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{database?.name}</Text>
        <Text style={styles.count}>{rows.length} rows</Text>
      </View>

      <RowList
        rows={rows}
        onDelete={handleDeleteRow}
        onEdit={(rowId) => router.push(`/row/${rowId}?dbId=${id}`)}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddRow}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  count: {
    fontSize: 16,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
  },
});

export default DatabaseScreen;
