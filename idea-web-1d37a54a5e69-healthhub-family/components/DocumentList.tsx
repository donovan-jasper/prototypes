import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Document } from '../types';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface DocumentListProps {
  documents: Document[];
  onDelete: (documentId: number) => Promise<void>;
  onView: (document: Document) => Promise<void>;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, onView }) => {
  const renderItem = ({ item }: { item: Document }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        <Ionicons
          name={item.type.includes('pdf') ? 'document-text' : 'image'}
          size={24}
          color="#666"
          style={styles.documentIcon}
        />
        <View>
          <Text style={styles.documentTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.documentType}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.documentActions}>
        <TouchableOpacity onPress={() => onView(item)} style={styles.actionButton}>
          <Ionicons name="eye" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
          <Ionicons name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleDelete = (documentId: number) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(documentId),
        },
      ]
    );
  };

  if (documents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No documents attached</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={documents}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    marginRight: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
    color: '#666',
  },
  documentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default DocumentList;
