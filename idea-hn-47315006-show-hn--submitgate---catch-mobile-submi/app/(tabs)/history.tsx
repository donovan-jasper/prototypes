import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useStore } from '../../store/useStore';
import { ScanResult } from '../../lib/types';
import { initDatabase, getScans } from '../../lib/database';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { isPremium } = useStore();

  useEffect(() => {
    const loadScans = async () => {
      try {
        await initDatabase();
        const savedScans = await getScans();
        setScans(savedScans);
      } catch (error) {
        console.error('Failed to load scans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, []);

  const renderItem = ({ item }: { item: ScanResult }) => {
    const criticalIssues = item.issues.filter(issue => issue.severity === 'critical').length;
    const warningIssues = item.issues.filter(issue => issue.severity === 'warning').length;

    return (
      <View style={styles.scanItem}>
        <View style={styles.scanHeader}>
          <View style={styles.platformIcon}>
            <Ionicons
              name={item.platform === 'ios' ? 'logo-apple' : 'logo-android'}
              size={24}
              color={item.platform === 'ios' ? '#000000' : '#3DDC84'}
            />
          </View>
          <View style={styles.scanInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.issueSummary}>
          {criticalIssues > 0 && (
            <View style={styles.issueCount}>
              <Ionicons name="alert-circle" size={16} color="#FF3B30" />
              <Text style={[styles.issueText, { color: '#FF3B30' }]}>{criticalIssues}</Text>
            </View>
          )}
          {warningIssues > 0 && (
            <View style={styles.issueCount}>
              <Ionicons name="warning" size={16} color="#FF9500" />
              <Text style={[styles.issueText, { color: '#FF9500' }]}>{warningIssues}</Text>
            </View>
          )}
          {item.passed && (
            <View style={styles.passedIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={[styles.issueText, { color: '#34C759' }]}>Passed</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan History</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Loading scans...</Text>
        </View>
      </View>
    );
  }

  if (scans.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan History</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubtext}>Your scan history will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        {!isPremium && (
          <Text style={styles.premiumNotice}>
            Free tier shows last 3 scans. Upgrade for full history.
          </Text>
        )}
      </View>
      <FlatList
        data={scans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  premiumNotice: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3C3C43',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
  },
  listContent: {
    paddingVertical: 10,
  },
  scanItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scanInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  issueSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  issueCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  passedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  issueText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  separator: {
    height: 10,
  },
});
