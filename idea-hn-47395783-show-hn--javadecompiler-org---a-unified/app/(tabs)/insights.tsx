import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useDecompilation } from '../../hooks/useDecompilation';
import { useSecurityScan } from '../../hooks/useSecurityScan';
import { SecurityFinding } from '../../lib/security/scanner';
import { Ionicons } from '@expo/vector-icons';
import SecurityBadge from '../../components/SecurityBadge';
import CodeViewer from '../../components/CodeViewer';
import { SECURITY_RULES } from '../../constants/security-rules';

const InsightsScreen = () => {
  const { currentDecompilation } = useDecompilation();
  const { scanResults, isScanning, scanError, startScan } = useSecurityScan();
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  useEffect(() => {
    if (currentDecompilation && !scanResults.length && !isScanning) {
      startScan();
    }
  }, [currentDecompilation]);

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

  const toggleFinding = (id: string) => {
    setExpandedFinding(expandedFinding === id ? null : id);
  };

  const renderFinding = ({ item }: { item: SecurityFinding }) => {
    const findingId = `${item.filePath}-${item.lineNumber}`;
    const isExpanded = expandedFinding === findingId;

    return (
      <TouchableOpacity
        style={styles.findingCard}
        onPress={() => toggleFinding(findingId)}
        activeOpacity={0.9}
      >
        <View style={styles.findingHeader}>
          <SecurityBadge severity={item.severity} score={0} />
          <Text style={styles.findingType}>{item.type}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666"
            style={styles.expandIcon}
          />
        </View>
        <Text style={styles.findingFile}>{item.filePath}</Text>
        <Text style={styles.findingDescription}>{item.description}</Text>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.sectionTitle}>Code Context</Text>
            <View style={styles.codeContainer}>
              <CodeViewer
                code={item.codeSnippet}
                language="java"
                showLineNumbers={true}
                startingLineNumber={item.lineNumber}
              />
            </View>

            <Text style={styles.sectionTitle}>Remediation</Text>
            <Text style={styles.remediationText}>{item.remediation}</Text>

            {item.details && (
              <>
                <Text style={styles.sectionTitle}>Details</Text>
                <Text style={styles.detailsText}>{item.details}</Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!currentDecompilation) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>Select a decompilation to analyze</Text>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Analyzing code for vulnerabilities...</Text>
        <Text style={styles.progressText}>
          {scanResults.length} findings detected so far
        </Text>
      </View>
    );
  }

  if (scanError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#d32f2f" />
        <Text style={styles.errorText}>Error: {scanError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={startScan}>
          <Text style={styles.retryButtonText}>Retry Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Security Insights</Text>
          <SecurityBadge
            severity={scanResults.length > 0 ? 'critical' : 'low'}
            score={scanResults.length}
          />
        </View>

        <View style={styles.filterContainer}>
          {severityFilters.map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                selectedSeverity === filter.value && styles.filterButtonActive
              ]}
              onPress={() => setSelectedSeverity(filter.value as any)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedSeverity === filter.value && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{scanResults.length}</Text>
            <Text style={styles.statLabel}>Total Findings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {scanResults.filter(f => f.severity === 'critical').length}
            </Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {scanResults.filter(f => f.severity === 'high').length}
            </Text>
            <Text style={styles.statLabel}>High</Text>
          </View>
        </View>
      </View>

      <View style={styles.findingsHeader}>
        <Text style={styles.findingsTitle}>Security Findings</Text>
        <Text style={styles.findingsCount}>{filteredFindings.length} items</Text>
      </View>

      <FlatList
        data={filteredFindings}
        renderItem={renderFinding}
        keyExtractor={(item, index) => `${item.filePath}-${item.lineNumber}-${index}`}
        contentContainerStyle={styles.findingsList}
        ListEmptyComponent={
          <View style={styles.emptyFindings}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#4CAF50" />
            <Text style={styles.emptyFindingsText}>No security issues found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  findingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  findingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  findingsCount: {
    fontSize: 14,
    color: '#666',
  },
  findingsList: {
    padding: 8,
  },
  findingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
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
  findingType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  expandIcon: {
    marginLeft: 8,
  },
  findingFile: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  findingDescription: {
    fontSize: 14,
    color: '#444',
  },
  expandedContent: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  codeContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  remediationText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 14,
    color: '#444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#444',
    marginTop: 16,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyFindings: {
    alignItems: 'center',
    padding: 32,
  },
  emptyFindingsText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default InsightsScreen;
