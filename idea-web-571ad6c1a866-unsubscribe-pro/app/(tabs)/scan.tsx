import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useEmailScan } from '../../hooks/useEmailScan';
import EmailCard from '../../components/EmailCard';
import { useEmailStore } from '../../store/email-store';
import { Email } from '../../types';

const ScanScreen = () => {
  const { isScanning, scanResult, error, scanInbox } = useEmailScan();
  const { emails, addEmail, removeEmail } = useEmailStore();

  useEffect(() => {
    // Initial scan when screen loads
    scanInbox();
  }, []);

  const handleRefresh = () => {
    scanInbox();
  };

  const handleUnsubscribe = (emailId: string) => {
    removeEmail(emailId);
  };

  if (isScanning && !scanResult) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Scanning your inbox...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.retryText} onPress={scanInbox}>
          Tap to retry
        </Text>
      </View>
    );
  }

  if (!scanResult) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No scan results available</Text>
        <Text style={styles.retryText} onPress={scanInbox}>
          Tap to scan inbox
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Inbox Scan Results</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{scanResult.totalEmails}</Text>
            <Text style={styles.statLabel}>Total Emails</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.important]}>{scanResult.importantCount}</Text>
            <Text style={styles.statLabel}>Important</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.promotional]}>{scanResult.promotionalCount}</Text>
            <Text style={styles.statLabel}>Promotional</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.spam]}>{scanResult.spamCount}</Text>
            <Text style={styles.statLabel}>Spam</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.subscription]}>{scanResult.subscriptionCount}</Text>
            <Text style={styles.statLabel}>Subscription</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={Object.values(scanResult.senders)}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <EmailCard
            email={{
              id: item.email,
              from: `${item.name} <${item.email}>`,
              subject: `${item.count} emails from ${item.name}`,
              body: '',
              date: new Date().toISOString(),
              headers: {},
            }}
            onUnsubscribe={handleUnsubscribe}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isScanning}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  summary: {
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  important: {
    color: '#4CAF50',
  },
  promotional: {
    color: '#2196F3',
  },
  spam: {
    color: '#F44336',
  },
  subscription: {
    color: '#9C27B0',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
});

export default ScanScreen;
