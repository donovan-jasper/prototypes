import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ComplianceIssue } from '../lib/types';

interface ComplianceIssueCardProps {
  issue: ComplianceIssue;
  onDocumentationPress?: () => void;
}

export default function ComplianceIssueCard({ issue, onDocumentationPress }: ComplianceIssueCardProps) {
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
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getSeverityColor(issue.severity) }]}>
      <View style={styles.header}>
        <Ionicons
          name={getSeverityIcon(issue.severity)}
          size={24}
          color={getSeverityColor(issue.severity)}
        />
        <Text style={styles.title}>{issue.title}</Text>
      </View>
      <Text style={styles.description}>{issue.description}</Text>
      <View style={styles.fixContainer}>
        <Text style={styles.fixLabel}>How to fix:</Text>
        <Text style={styles.fixText}>{issue.fix}</Text>
      </View>
      {issue.documentationUrl && (
        <TouchableOpacity style={styles.docLink} onPress={onDocumentationPress}>
          <Ionicons name="link" size={16} color="#007AFF" />
          <Text style={styles.docLinkText}>View documentation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333333',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  fixContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  fixLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  fixText: {
    fontSize: 14,
    color: '#666666',
  },
  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  docLinkText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
});
