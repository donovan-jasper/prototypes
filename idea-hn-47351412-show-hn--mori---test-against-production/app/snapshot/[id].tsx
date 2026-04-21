import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getSchemaDiff } from '../../lib/database/schemaDiff';
import SchemaDiffItem from '../../components/SchemaDiffItem';
import { useSnapshotStore } from '../../lib/store/snapshots'; // Keep for potential future use
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { SchemaDiffReportItem } from '../../types/database'; // Import type

const SchemaDiffScreen = () => {
  const { id } = useLocalSearchParams();
  const [diffData, setDiffData] = useState<SchemaDiffReportItem[]>([]); // Type state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Type state
  const { colors } = useTheme(); // Destructure colors from theme

  const fetchDiff = async () => {
    if (!id) {
      setError("Snapshot ID is missing.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Ensure id is a string, useLocalSearchParams can return string | string[]
      const snapshotId = Array.isArray(id) ? id[0] : id;
      const diff = await getSchemaDiff(snapshotId);
      setDiffData(diff);
    } catch (err: any) { // Catch any error type
      console.error("Failed to fetch schema diff:", err);
      setError(err.message || "An unknown error occurred while fetching schema differences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiff();
  }, [id]); // Depend on id to refetch if it changes

  const handleRefresh = () => {
    fetchDiff();
  };

  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading schema differences...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} style={styles.errorIcon} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
          <Text style={{ color: colors.primary, marginLeft: 8 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (diffData.length === 0) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <MaterialIcons name="check-circle-outline" size={48} color={colors.primary} style={styles.noChangesIcon} />
        <Text style={[styles.noChangesText, { color: colors.text }]}>No schema changes detected</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
          <Text style={{ color: colors.primary, marginLeft: 8 }}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Schema Differences</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
          <Text style={{ color: colors.primary, marginLeft: 8 }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {diffData.map((item) => (
        <SchemaDiffItem key={item.id} item={item} /> // Use item.id for key
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22, // Slightly larger title
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20, // Make it a pill shape
    backgroundColor: 'rgba(0, 0, 0, 0.05)', // Subtle background
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  noChangesIcon: {
    marginBottom: 16,
  },
  noChangesText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default SchemaDiffScreen;
