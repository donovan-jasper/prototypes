import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useEmailStore } from '../../store/email-store';
import EmailCard from '../../components/EmailCard';
import { Sender } from '../../types';
import { useNavigation } from '@react-navigation/native';

const ScanScreen = () => {
  const {
    senders,
    isLoading,
    error,
    loadSenders,
    scanInbox,
    unsubscribeFromSender
  } = useEmailStore();
  const navigation = useNavigation();

  useEffect(() => {
    loadSenders();
  }, []);

  const handleRefresh = async () => {
    await scanInbox();
    await loadSenders();
  };

  const handleUnsubscribe = async (domain: string) => {
    await unsubscribeFromSender(domain);
    await loadSenders();
  };

  const renderItem = ({ item }: { item: Sender }) => (
    <EmailCard
      sender={item}
      onUnsubscribe={() => handleUnsubscribe(item.domain)}
      onPress={() => navigation.navigate('sender-details', { domain: item.domain })}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No senders found in your inbox.</Text>
      <Text style={styles.emptySubtext}>Pull down to refresh or connect your email account.</Text>
      <TouchableOpacity style={styles.scanButton} onPress={scanInbox}>
        <Text style={styles.scanButtonText}>Scan Inbox</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && senders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your email senders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={senders}
        renderItem={renderItem}
        keyExtractor={(item) => item.domain}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        ListEmptyComponent={renderEmptyState}
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
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ScanScreen;
