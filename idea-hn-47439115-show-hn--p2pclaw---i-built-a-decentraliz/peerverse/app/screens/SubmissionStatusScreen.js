import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPendingSubmissions, getProcessingSubmissions, getCompletedSubmissions, getFailedSubmissions, retryFailedStep } from '../services/localStorage';
import { processSubmissionQueue } from '../services/localStorage';

const SubmissionStatusScreen = ({ navigation }) => {
  const [queueStatus, setQueueStatus] = useState({
    pendingCount: 0,
    processingCount: 0,
    completedCount: 0,
    failedCount: 0
  });
  const [failedSubmissions, setFailedSubmissions] = useState([]);
  const [completedSubmissions, setCompletedSubmissions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    updateQueueStatus();
  }, []);

  const updateQueueStatus = async () => {
    setIsRefreshing(true);
    try {
      const pendingSubmissions = await getPendingSubmissions();
      const processingSubmissions = await getProcessingSubmissions();
      const completedSubmissions = await getCompletedSubmissions();
      const failedSubmissions = await getFailedSubmissions();

      setQueueStatus({
        pendingCount: pendingSubmissions.length,
        processingCount: processingSubmissions.length,
        completedCount: completedSubmissions.length,
        failedCount: failedSubmissions.length
      });

      setFailedSubmissions(failedSubmissions);
      setCompletedSubmissions(completedSubmissions);
    } catch (error) {
      console.error('Error updating queue status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = async (submissionId) => {
    try {
      await retryFailedStep(submissionId);
      await processSubmissionQueue();
      updateQueueStatus();
    } catch (error) {
      console.error('Error retrying submission:', error);
    }
  };

  const renderStatusItem = ({ item }) => (
    <View style={styles.statusItem}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>{item.title}</Text>
        <Text style={styles.statusDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.statusDetails}>
        <Text style={styles.statusText}>Status: {item.status}</Text>
        {item.error && (
          <Text style={styles.errorText}>Error: {item.error}</Text>
        )}
        {item.status === 'failed' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRetry(item.id)}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderQueueSummary = () => (
    <View style={styles.queueSummary}>
      <View style={styles.summaryItem}>
        <Ionicons name="time-outline" size={24} color="#6c757d" />
        <Text style={styles.summaryText}>Pending: {queueStatus.pendingCount}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Ionicons name="sync-outline" size={24} color="#0d6efd" />
        <Text style={styles.summaryText}>Processing: {queueStatus.processingCount}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#198754" />
        <Text style={styles.summaryText}>Completed: {queueStatus.completedCount}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Ionicons name="alert-circle-outline" size={24} color="#dc3545" />
        <Text style={styles.summaryText}>Failed: {queueStatus.failedCount}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Submission Queue</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={updateQueueStatus}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="refresh" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {renderQueueSummary()}

      {failedSubmissions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Failed Submissions</Text>
          <FlatList
            data={failedSubmissions}
            renderItem={renderStatusItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {completedSubmissions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Submissions</Text>
          <FlatList
            data={completedSubmissions}
            renderItem={renderStatusItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#343a40',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  queueSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryText: {
    marginTop: 4,
    fontSize: 12,
    color: '#495057',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#212529',
  },
  statusItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  statusDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  statusDetails: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d6efd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
});

export default SubmissionStatusScreen;
