import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document } from '../types';
import Colors from '../constants/Colors';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onView?: (document: Document) => void;
  onDelete?: (documentId: number) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onView, onDelete }) => {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return 'image-outline';
    if (type.includes('pdf')) return 'document-text-outline';
    return 'document-outline';
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={getFileIcon(document.type)} size={24} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{document.title}</Text>
        <Text style={styles.date}>{format(new Date(document.uploadDate), 'MMM d, yyyy')}</Text>
      </View>
      <View style={styles.actions}>
        {onView && (
          <TouchableOpacity onPress={() => onView(document)} style={styles.actionButton}>
            <Ionicons name="eye-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(document.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default DocumentCard;
