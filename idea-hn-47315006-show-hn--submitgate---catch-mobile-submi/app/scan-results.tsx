import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { ComplianceIssue } from '../lib/types';
import { saveScan } from '../lib/database';

export default function ScanResultsScreen() {
  const router = useRouter();
  const { currentScan, addScan, isPremium, scanCount, incrementScanCount } = useStore();

  if (!currentScan) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No scan results available</Text>
      </View>
    );
  }

  const criticalIssues = currentScan.issues.filter(i => i.severity === 'critical');
  const warningIssues = currentScan.issues.filter(i => i.severity === 'warning');
  const infoIssues = currentScan.issues.filter(i => i.severity === 'info');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF3B30';
      case 'warning': return '#FF9500';
      case 'info': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'help-circle';
    }
  };

  const renderIssueCard = (issue: ComplianceIssue) => (
    <View key={issue.id} style={[styles.issueCard, { borderLeftColor: getSeverityColor(issue.severity) }]}>
      <View style={styles.issueHeader}>
        <Ionicons
          name={getSeverityIcon(issue.severity)}
          size={24}
          color={getSeverityColor(issue.severity)}
        />
        <Text style={styles.issueTitle}>{issue.title}</Text>
      </View>
      <Text style={styles.issueDescription}>{issue.description}</Text>
      <View style={styles.fixContainer}>
        <Text style={styles.fixLabel}>How to fix:</Text>
        <Text style={styles.fixText}>{issue.fix}</Text>
      </View>
      {issue.documentationUrl && (
        <TouchableOpacity style={styles.docLink}>
          <Ionicons name="link" size={16} color="#007AFF" />
          <Text style={styles.docLinkText}>View documentation</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleSaveScan = async () => {
    if (!isPremium && scanCount >= 3) {
      Alert.alert(
        'Scan Limit Reached',
        'You\'ve reached your free scan limit. Upgrade to save unlimited scans.',
        [
          { text: 'Cancel' },
          { text: 'Upgrade', onPress: () => router.push('/settings') }
        ]
      );
      return;
    }

    try {
      await saveScan(currentScan);
      addScan(currentScan);
      if (!isPremium) {
        incrementScanCount();
      }
      Alert.alert('Success', 'Scan saved to your history');
    } catch (error) {
      console.error('Failed to save scan:', error);
      Alert.alert('Error', 'Failed to save scan. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Scan Results</Text>
          <Text style={styles.headerSubtitle}>{currentScan.fileName}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.summaryCard, currentScan.passed ? styles.passedCard : styles.failedCard]}>
          <Ionicons
            name={currentScan.passed ? 'checkmark-circle' : 'close-circle'}
            size={48}
            color={currentScan.passed ? '#34C759' : '#FF3B30'}
          />
          <Text style={styles.summaryTitle}>
            {currentScan.passed ? 'Ready to Submit' : 'Issues Found'}
          </Text>
          <Text style={styles.summaryText}>
            {currentScan.passed
              ? 'No critical issues detected. Your build looks good!'
              : `Found ${currentScan.issues.length} issue${currentScan.issues.length !== 1 ? 's' : ''} that need attention`}
          </Text>
        </View>

        {criticalIssues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="close-circle" size={20} color="#FF3B30" />
              <Text style={[styles.sectionTitle, { color: '#FF3B30' }]}>
                Critical Issues ({criticalIssues.length})
              </Text>
            </View>
            {criticalIssues.map(renderIssueCard)}
          </View>
        )}

        {warningIssues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <Text style={[styles.sectionTitle, { color: '#FF9500' }]}>
                Warnings ({warningIssues.length})
              </Text>
            </View>
            {warningIssues.map(renderIssueCard)}
          </View>
        )}

        {infoIssues.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={[styles.sectionTitle, { color: '#007AFF' }]}>
                Info ({infoIssues.length})
              </Text>
            </View>
            {infoIssues.map(renderIssueCard)}
          </View>
        )}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveScan}
        >
          <Ionicons name="save" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Scan</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  passedCard: {
    backgroundColor: '#E5F9F0',
  },
  failedCard: {
    backgroundColor: '#FFEBEE',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  issueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000000',
  },
  issueDescription: {
    fontSize: 14,
    color: '#5A5A5A',
    marginBottom: 12,
  },
  fixContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  fixLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
    marginBottom: 4,
  },
  fixText: {
    fontSize: 14,
    color: '#000000',
  },
  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  docLinkText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});
