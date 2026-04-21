import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getSchemaDiff } from '../../lib/database/schemaDiff';
import SchemaDiffItem from '../../components/SchemaDiffItem';
import { useSnapshotStore } from '../../lib/store/snapshots';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const SchemaDiffScreen = () => {
  const { id } = useLocalSearchParams();
  const [diffData, setDiffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  const fetchDiff = async () => {
    try {
      setLoading(true);
      const diff = await getSchemaDiff(id);
      setDiffData(diff);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiff();
  }, [id]);

  const handleRefresh = () => {
    fetchDiff();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (diffData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.noChangesText, { color: theme.colors.text }]}>No schema changes detected</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary }}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Schema Differences</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.primary }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {diffData.map((item, index) => (
        <SchemaDiffItem key={`${item.tableName}-${index}`} item={item} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  noChangesText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default SchemaDiffScreen;
