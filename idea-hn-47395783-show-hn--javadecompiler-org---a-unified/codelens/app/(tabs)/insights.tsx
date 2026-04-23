import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSecurityScan } from '../../hooks/useSecurityScan';
import { SecurityBadge } from '../../components/SecurityBadge';
import { useDecompilation } from '../../hooks/useDecompilation';
import CodeViewer from '../../components/CodeViewer';

const InsightsScreen = () => {
  const { currentDecompilation } = useDecompilation();
  const { securityFindings, securityScore, isScanning } = useSecurityScan(currentDecompilation?.files || []);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  const getFileContent = (filePath: string) => {
    const file = currentDecompilation.files.find(f => f.path === filePath);
    return file ? file.content : '';
  };

  const getVulnerableLines = (filePath: string) => {
    const finding = securityFindings.find(f =>
      f.locations.some(loc => loc.filePath === filePath)
    );

    if (!finding) return [];

    return finding.locations
      .filter(loc => loc.filePath === filePath)
      .map(loc => loc.lineNumber);
  };

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
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => setSelectedLocation(item)}
              >
                <Text style={styles.filePath}>{item.filePath}:{item.lineNumber}</Text>
                <ScrollView horizontal style={styles.codeSnippetContainer}>
                  <Text style={styles.codeSnippet}>{item.codeSnippet}</Text>
                </ScrollView>
              </TouchableOpacity>
            )}
          />

          {selectedLocation && (
            <View style={styles.codeViewerContainer}>
              <Text style={styles.codeViewerTitle}>Code Viewer</Text>
              <CodeViewer
                code={getFileContent(selectedLocation.filePath)}
                vulnerableLines={getVulnerableLines(selectedLocation.filePath)}
                onLinePress={(lineNumber) => {
                  const location = selectedFinding.locations.find(
                    loc => loc.filePath === selectedLocation.filePath && loc.lineNumber === lineNumber
                  );
                  if (location) {
                    setSelectedLocation(location);
                  }
                }}
              />
            </View>
          )}
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
  findingDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16
  },
  locationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  locationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  filePath: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  codeSnippetContainer: {
    maxHeight: 60
  },
  codeSnippet: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#333'
  },
  codeViewerContainer: {
    flex: 1,
    marginTop: 16
  },
  codeViewerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  }
});

export default InsightsScreen;
