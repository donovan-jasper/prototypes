import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useDecompilation } from '../../hooks/useDecompilation';
import { useSecurityScan } from '../../hooks/useSecurityScan';
import { SecurityFinding } from '../../lib/security/scanner';
import { Ionicons } from '@expo/vector-icons';

const InsightsScreen = () => {
  const { currentDecompilation } = useDecompilation();
  const { scanResults, isScanning, scanError } = useSecurityScan();
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const severityFilters = [
    { label: 'All', value: 'all' },
    { label: 'Critical', value: 'critical' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  const filteredFindings = selectedSeverity === 'all'
    ? scanResults
    : scanResults.filter(finding => finding.severity === selectedSeverity);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFBB33';
      case 'low': return '#00C851';
      default: return '#999999';
    }
  };

  const renderFinding = ({ item }: { item: SecurityFinding }) => (
    <View style={styles.findingCard}>
      <View style={styles.findingHeader}>
        <Text style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          {item.severity}
        </Text>
        <Text style={styles.findingType}>{item.type}</Text>
      </View>
      <Text style={styles.findingFile}>{item.filePath}</Text>
      <Text style={styles.findingDescription}>{item.description}</Text>
      <View style={styles.codeSnippet}>
        <Text style={styles.codeLineNumber}>{item.lineNumber}</Text>
        <Text style={styles.codeContent}>{item.codeSnippet}</Text>
      </View>
      <Text style={styles.remediationTitle}>Remediation:</Text>
      <Text style={styles.remediationText}>{item.remediation}</Text>
    </View>
  );

  if (!currentDecompilation) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No decompilation selected</Text>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Scanning for vulnerabilities...</Text>
      </View>
    );
  }

  if (scanError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {scanError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Security Overview</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{scanResults.length}</Text>
          <Text style={styles.scoreLabel}>Vulnerabilities</Text>
        </View>
        <View style={styles.filterContainer}>
          {severityFilters.map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                selectedSeverity === filter.value && styles.activeFilterButton
              ]}
              onPress={() => setSelectedSeverity(filter.value as any)}
            >
              <Text style={[
                styles.filterText,
                selectedSeverity === filter.value && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredFindings}
        renderItem={renderFinding}
        keyExtractor={(item, index) => `${item.filePath}-${index}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyFindingsContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.emptyFindingsText}>No vulnerabilities found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#e3f2fd',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  findingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  findingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBadge: {
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  findingType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  findingFile: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  findingDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  codeSnippet: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  codeLineNumber: {
    color: '#999',
    marginRight: 8,
    fontFamily: 'monospace',
  },
  codeContent: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  remediationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  remediationText: {
    fontSize: 14,
    color: '#444',
  },
  emptyFindingsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyFindingsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default InsightsScreen;
