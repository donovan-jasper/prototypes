import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { scanForVulnerabilities, calculateSecurityScore } from '../lib/security/scanner';
import { SecurityBadge } from './SecurityBadge';

interface SecurityFinding {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  matches: RegExpMatchArray[];
  locations: Array<{
    filePath: string;
    lineNumber: number;
    codeSnippet: string;
  }>;
}

interface SecurityScannerProps {
  files: Array<{ path: string; content: string }>;
  onScanComplete?: (findings: SecurityFinding[], score: number) => void;
}

const SecurityScanner: React.FC<SecurityScannerProps> = ({ files, onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([]);
  const [securityScore, setSecurityScore] = useState(100);

  useEffect(() => {
    const scan = async () => {
      setIsScanning(true);
      try {
        const findings = scanForVulnerabilities(files);
        const score = calculateSecurityScore(findings);

        setSecurityFindings(findings);
        setSecurityScore(score);

        if (onScanComplete) {
          onScanComplete(findings, score);
        }
      } catch (error) {
        console.error('Security scan failed:', error);
      } finally {
        setIsScanning(false);
      }
    };

    scan();
  }, [files, onScanComplete]);

  if (isScanning) {
    return (
      <View style={styles.scannerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.scanningText}>Scanning for vulnerabilities...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Scan Results</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Security Score:</Text>
          <Text style={[styles.scoreValue, securityScore < 70 ? styles.lowScore : styles.highScore]}>
            {securityScore}
          </Text>
        </View>
      </View>

      {securityFindings.length > 0 ? (
        <View style={styles.findingsContainer}>
          {securityFindings.map((finding, index) => (
            <View key={`${finding.type}-${index}`} style={styles.findingItem}>
              <View style={styles.findingHeader}>
                <Text style={styles.findingType}>{finding.type}</Text>
                <SecurityBadge severity={finding.severity} />
              </View>
              <Text style={styles.findingDescription}>{finding.description}</Text>
              <Text style={styles.findingCount}>{finding.locations.length} occurrence(s)</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noFindingsContainer}>
          <Text style={styles.noFindingsText}>No security vulnerabilities found</Text>
          <Text style={styles.noFindingsSubtext}>Your code appears to be secure!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scanningText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  highScore: {
    color: 'green',
  },
  lowScore: {
    color: 'red',
  },
  findingsContainer: {
    flex: 1,
  },
  findingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  findingType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  findingDescription: {
    color: '#666',
    marginBottom: 4,
  },
  findingCount: {
    color: '#888',
    fontSize: 12,
  },
  noFindingsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noFindingsText: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  noFindingsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default SecurityScanner;
