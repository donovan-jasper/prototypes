import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSecurityScan } from '../../hooks/useSecurityScan';
import { SecurityBadge } from '../../components/SecurityBadge';
import { useDecompilation } from '../../hooks/useDecompilation';
import { CodeViewer } from '../../components/CodeViewer';

const InsightsScreen = () => {
  const { currentDecompilation } = useDecompilation();
  const { securityFindings, securityScore, isScanning } = useSecurityScan(currentDecompilation?.files || []);
  const [selectedFinding, setSelectedFinding] = React.useState(null);

  if (!currentDecompilation) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No decompilation selected</Text>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Scanning for vulnerabilities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Insights</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Security Score:</Text>
          <Text style={[styles.scoreValue, securityScore < 70 ? styles.lowScore : styles.highScore]}>
            {securityScore}
          </Text>
        </View>
      </View>

      {selectedFinding ? (
        <View style={styles.detailContainer}>
          <TouchableOpacity onPress={() => setSelectedFinding(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Findings</Text>
          </TouchableOpacity>

          <Text style={styles.findingTitle}>{selectedFinding.type}</Text>
          <SecurityBadge severity={selectedFinding.severity} />
          <Text style={styles.findingDescription}>{selectedFinding.description}</Text>

          <Text style={styles.locationsTitle}>Locations ({selectedFinding.locations.length})</Text>

          <FlatList
            data={selectedFinding.locations}
            keyExtractor={(item, index) => `${item.filePath}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.locationItem}>
                <Text style={styles.filePath}>{item.filePath}:{item.lineNumber}</Text>
                <ScrollView horizontal style={styles.codeSnippetContainer}>
                  <CodeViewer
                    code={item.codeSnippet}
                    language="java"
                    showLineNumbers={false}
                    style={styles.codeSnippet}
                  />
                </ScrollView>
              </View>
            )}
          />
        </View>
      ) : (
        <FlatList
          data={securityFindings}
          keyExtractor={(item) => `${item.type}-${item.locations.length}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.findingItem}
              onPress={() => setSelectedFinding(item)}
            >
              <View style={styles.findingHeader}>
                <Text style={styles.findingType}>{item.type}</Text>
                <SecurityBadge severity={item.severity} />
              </View>
              <Text style={styles.findingDescription}>{item.description}</Text>
              <Text style={styles.findingCount}>{item.locations.length} occurrence(s)</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No security vulnerabilities found</Text>
              <Text style={styles.emptySubtext}>Your code appears to be secure!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scoreLabel: {
    fontSize: 16,
    marginRight: 8
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  highScore: {
    color: 'green'
  },
  lowScore: {
    color: 'red'
  },
  findingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  findingType: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  findingDescription: {
    color: '#666',
    marginBottom: 4
  },
  findingCount: {
    color: '#888',
    fontSize: 12
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32
  },
  detailContainer: {
    flex: 1
  },
  backButton: {
    marginBottom: 16
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16
  },
  findingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  locationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8
  },
  locationItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4
  },
  filePath: {
    fontFamily: 'monospace',
    marginBottom: 8,
    color: '#555'
  },
  codeSnippetContainer: {
    maxHeight: 100
  },
  codeSnippet: {
    fontFamily: 'monospace',
    fontSize: 12
  }
});

export default InsightsScreen;
