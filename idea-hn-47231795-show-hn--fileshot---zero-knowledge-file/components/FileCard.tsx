import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export const FileCard = ({ file, onShare, onDelete }) => {
  const getFileIcon = () => {
    if (file.mimeType?.startsWith('image/')) {
      return 'image-outline';
    } else if (file.mimeType?.startsWith('video/')) {
      return 'videocam-outline';
    } else if (file.mimeType?.startsWith('audio/')) {
      return 'musical-notes-outline';
    } else if (file.name?.endsWith('.pdf')) {
      return 'document-text-outline';
    } else if (file.name?.endsWith('.doc') || file.name?.endsWith('.docx')) {
      return 'document-outline';
    } else if (file.name?.endsWith('.xls') || file.name?.endsWith('.xlsx')) {
      return 'grid-outline';
    } else {
      return 'document-outline';
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={getFileIcon()} size={32} color={Colors.primary} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={styles.fileSize}>
          {Math.round(file.size / 1024)} KB
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={onShare} style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmDelete} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  iconContainer: {
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
});
