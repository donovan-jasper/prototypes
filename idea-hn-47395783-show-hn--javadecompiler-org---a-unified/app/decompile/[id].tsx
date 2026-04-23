import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDecompilation } from '../../hooks/useDecompilation';
import FileTree from '../../components/FileTree';
import CodeViewer from '../../components/CodeViewer';
import { useSecurityScan } from '../../hooks/useSecurityScan';
import { Ionicons } from '@expo/vector-icons';

const DecompilationViewer = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentDecompilation, loadDecompilation } = useDecompilation();
  const { scanResults } = useSecurityScan();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'security'>('code');

  useEffect(() => {
    if (id) {
      loadDecompilation(id);
    }
  }, [id]);

  if (!currentDecompilation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading decompilation...</Text>
      </View>
    );
  }

  const fileTreeData = currentDecompilation.files.reduce((acc, file) => {
    const pathParts = file.path.split('/');
    let currentLevel = acc;

    pathParts.forEach((part, index) => {
      const isFile = index === pathParts.length - 1;
      const existingNode = currentLevel.find(node => node.name === part);

      if (existingNode) {
        if (isFile) {
          existingNode.securityScore = scanResults.score;
          existingNode.severity = scanResults.severity;
        } else {
          currentLevel = existingNode.children || [];
        }
      } else {
        const newNode = {
          id: isFile ? file.id : `${file.id}-${index}`,
          name: part,
          type: isFile ? 'file' : 'directory',
          children: isFile ? undefined : [],
          securityScore: isFile ? scanResults.score : undefined,
          severity: isFile ? scanResults.severity : undefined,
        };

        currentLevel.push(newNode);
        if (!isFile) {
          currentLevel = newNode.children || [];
        }
      }
    });

    return acc;
  }, [] as any[]);

  const selectedFile = currentDecompilation.files.find(file => file.id === selectedFileId);
  const fileSecurityFindings = selectedFile
    ? scanResults.findings.filter(finding => finding.filePath === selectedFile.path)
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{currentDecompilation.fileName}</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'code' && styles.activeTab]}
            onPress={() => setActiveTab('code')}
          >
            <Text style={styles.tabText}>Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'security' && styles.activeTab]}
            onPress={() => setActiveTab('security')}
          >
            <Text style={styles.tabText}>Security</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.fileTreeContainer}>
          <FileTree
            files={fileTreeData}
            onFileSelect={setSelectedFileId}
            selectedFileId={selectedFileId}
          />
        </View>

        {activeTab === 'code' ? (
          <View style={styles.codeViewerContainer}>
            {selectedFile ? (
              <>
                <View style={styles.fileInfo}>
                  <Text style={styles.filePath}>{selectedFile.path}</Text>
                  <Text style={styles.fileSize}>{(selectedFile.content.length / 1024).toFixed(2)} KB</Text>
                </View>
                <CodeViewer
                  code={selectedFile.content}
                  language={selectedFile.language}
                  securityFindings={fileSecurityFindings}
                />
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>Select a file to view code</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.securityContainer}>
            <View style={styles.securitySummary}>
              <Text style={styles.securityScore}>Security Score: {scanResults.score}</Text>
              <Text style={styles.securitySeverity}>Severity: {scanResults.severity}</Text>
              <Text style={styles.vulnerabilityCount}>
                {scanResults.findings.length} vulnerabilities found
              </Text>
            </View>

            {selectedFile ? (
              <View style={styles.fileSecurity}>
                <Text style={styles.fileSecurityTitle}>Security Findings for {selectedFile.path}</Text>
                {fileSecurityFindings.length > 0 ? (
                  fileSecurityFindings.map((finding, index) => (
                    <View key={index} style={styles.findingCard}>
                      <Text style={styles.findingType}>{finding.type}</Text>
                      <Text style={styles.findingDescription}>{finding.description}</Text>
                      <Text style={styles.findingRemediation}>Remediation: {finding.remediation}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noFindingsText}>No security findings for this file</Text>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="shield-checkmark-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>Select a file to view security details</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196f3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  fileTreeContainer: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  codeViewerContainer: {
    width: '70%',
    flex: 1,
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filePath: {
    fontSize: 14,
    color: '#666',
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  securityContainer: {
    width: '70%',
    flex: 1,
    padding: 16,
  },
  securitySummary: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  securityScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  securitySeverity: {
    fontSize: 16,
    marginBottom: 4,
  },
  vulnerabilityCount: {
    fontSize: 14,
    color: '#666',
  },
  fileSecurity: {
    flex: 1,
  },
  fileSecurityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  findingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  findingType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 4,
  },
  findingDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  findingRemediation: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
  },
  noFindingsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default DecompilationViewer;
