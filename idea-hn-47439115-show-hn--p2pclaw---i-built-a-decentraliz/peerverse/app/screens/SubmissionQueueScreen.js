import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getPendingSubmissions, getProcessingSubmissions, getCompletedSubmissions, getFailedSubmissions, retryFailedSubmission } from '../services/localStorage';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

const SubmissionQueueScreen = ({ navigation }) => {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Set up network listener
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    // Load initial data
    loadSubmissions();

    return () => unsubscribe();
  }, []);

  const loadSubmissions = async () => {
    setIsRefreshing(true);
    try {
      let submissions = [];
      switch (filter) {
        case 'pending':
          submissions = await getPendingSubmissions();
          break;
        case 'processing':
          submissions = await getProcessingSubmissions();
          break;
        case 'completed':
          submissions = await getCompletedSubmissions();
          break;
        case 'failed':
          submissions = await getFailedSubmissions();
          break;
        default:
          submissions = [
            ...await getPendingSubmissions(),
            ...await getProcessingSubmissions(),
            ...await getCompletedSubmissions(),
            ...await getFailedSubmissions()
          ];
      }
      setSubmissions(submissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      Alert.alert('Error', 'Failed to load submissions');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = async (submission) => {
    if (!isOnline) {
      Alert.alert('Offline', 'You need to be online to retry submissions');
      return;
    }

    try {
      await retryFailedSubmission(submission);
      Alert.alert('Success', 'Submission retry started');
      loadSubmissions();
    } catch (error) {
      console.error('Retry failed:', error);
      Alert.alert('Error', 'Failed to retry submission');
    }
  };

  const renderSubmissionItem = ({ item }) => {
    const statusColor = {
      pending: '#FFC107',
      processing: '#2196F3',
      completed: '#4CAF50',
      failed: '#F44336'
    };

    return (
      <View style={styles.submissionItem}>
        <View style={styles.submissionHeader}>
          <Text style={styles.submissionTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor[item.status] }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.submissionAuthors} numberOfLines={1}>
          {item.authors.join(', ')}
        </Text>
        <Text style={styles.submissionDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        {item.status === 'failed' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRetry(item)}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFilterButtons = () => {
    const filters = [
      { id: 'all', label: 'All' },
      { id: 'pending', label: 'Pending' },
      { id: 'processing', label: 'Processing' },
      { id: 'completed', label: 'Completed' },
      { id: 'failed', label: 'Failed' }
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterButton, filter === f.id && styles.activeFilter]}
            onPress={() => {
              setFilter(f.id);
              loadSubmissions();
            }}
          >
            <Text style={[
              styles.filterText,
              filter === f.id && styles.activeFilterText
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Submission Queue</Text>
        <View style={[styles.networkStatus, isOnline ? styles.online : styles.offline]}>
          <Ionicons
            name={isOnline ? 'cloud' : 'cloud-offline'}
            size={16}
            color={isOnline ? '#4CAF50' : '#F44336'}
          />
          <Text style={styles.networkText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {renderFilterButtons()}

      {isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderSubmissionItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No submissions found</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  online: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  offline: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  networkText: {
    marginLeft: 5,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  submissionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  submissionAuthors: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 12,
    color: '#999',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});

export default SubmissionQueueScreen;
