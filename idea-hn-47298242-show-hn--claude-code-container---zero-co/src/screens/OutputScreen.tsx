import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useSession } from '../context/SessionContext';
import { useCodeExecution } from '../hooks/useCodeExecution';

export default function OutputScreen() {
  const { outputs, clearOutputs, sessionId } = useSession();
  const { executionError } = useCodeExecution();

  const renderOutput = ({ item }: { item: any }) => (
    <View style={styles.outputItem}>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
      <ScrollView horizontal>
        <Text style={styles.outputText}>{item.output}</Text>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Output</Text>
        {outputs.length > 0 && (
          <TouchableOpacity onPress={clearOutputs} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {executionError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{executionError}</Text>
        </View>
      )}

      {outputs.length === 0 && !executionError ? (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholder}>
            {sessionId ? 'Run code to see output here...' : 'Connecting to server...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={outputs}
          renderItem={renderOutput}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.outputList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#e2e8f0',
    fontSize: 12,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ef4444',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholder: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  outputList: {
    padding: 16,
  },
  outputItem: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timestamp: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  outputText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
