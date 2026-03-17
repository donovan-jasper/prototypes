import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getRecipients, deleteRecipient } from '../../lib/recipients';
import { Recipient } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function VaultScreen() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    setLoading(true);
    try {
      const results = await getRecipients();
      setRecipients(results);
    } catch (error) {
      console.error('Failed to load recipients:', error);
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipient = (recipient: Recipient) => {
    Alert.alert(
      'Delete Recipient',
      `Are you sure you want to delete ${recipient.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipient(recipient.id);
              await loadRecipients();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recipient');
            }
          },
        },
      ]
    );
  };

  const handleAddRecipient = () => {
    router.push({
      pathname: '/gift/send',
      params: { addRecipient: 'true' },
    });
  };

  const renderRecipientCard = ({ item }: { item: Recipient }) => (
    <View style={styles.recipientCard}>
      <View style={styles.recipientInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.recipientDetails}>
          <Text style={styles.recipientName}>{item.name}</Text>
          {item.email && <Text style={styles.recipientContact}>{item.email}</Text>}
          {item.phone && <Text style={styles.recipientContact}>{item.phone}</Text>}
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRecipient(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>👥</Text>
      <Text style={styles.emptyStateTitle}>No Recipients Yet</Text>
      <Text style={styles.emptyStateText}>
        Add recipients to quickly send gifts to your favorite people
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddRecipient}>
        <Text style={styles.emptyStateButtonText}>Add Your First Recipient</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gift Vault</Text>
        <Text style={styles.headerSubtitle}>
          {recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading recipients...</Text>
        </View>
      ) : (
        <FlatList
          data={recipients}
          renderItem={renderRecipientCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {recipients.length > 0 && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecipient}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Recipient</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  recipientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recipientContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
