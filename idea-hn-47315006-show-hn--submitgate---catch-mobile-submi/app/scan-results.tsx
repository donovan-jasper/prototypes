import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { ComplianceIssue } from '../lib/types';

export default function ScanResultsScreen() {
  const router = useRouter();
  const { currentScan } = useStore();

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

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passedCard: {
    borderWidth: 2,
    borderColor: '#34C759',
  },
  failedCard: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#8E8E93',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 10,
    flex: 1,
  },
  issueDescription: {
    fontSize: 15,
    color: '#3C3C43',
    marginBottom: 12,
    lineHeight: 20,
  },
  fixContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fixLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fixText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    fontFamily: 'Courier',
  },
  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  docLinkText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 40,
  },
  bottomPadding: {
    height: 40,
  },
});
