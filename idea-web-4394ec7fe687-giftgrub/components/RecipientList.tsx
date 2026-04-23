import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Recipient } from '../types';

interface RecipientListProps {
  recipients: Recipient[];
  onSelect: (recipient: Recipient) => void;
  onEdit: (recipient: Recipient) => void;
  onDelete: (recipient: Recipient) => void;
}

const RecipientList: React.FC<RecipientListProps> = ({ recipients, onSelect, onEdit, onDelete }) => {
  const renderItem = ({ item }: { item: Recipient }) => (
    <TouchableOpacity onPress={() => onSelect(item)} style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.name}>{item.name}</Text>
        {item.preferences?.birthday && (
          <Text style={styles.date}>
            Birthday: {new Date(item.preferences.birthday).toLocaleDateString()}
          </Text>
        )}
        {item.lastGift && (
          <Text style={styles.lastGift}>
            Last gift: {new Date(item.lastGift.sent_at).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item)} style={[styles.actionButton, styles.deleteButton]}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={recipients}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipients found. Add one to get started!</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  itemContainer: {
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
  itemContent: {
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastGift: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionText: {
    fontSize: 14,
    color: '#333',
  },
  deleteText: {
    color: '#d32f2f',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default RecipientList;
