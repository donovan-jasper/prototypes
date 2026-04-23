import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { EncryptionBadge } from './EncryptionBadge';

interface FileCardProps {
  file: {
    id: string;
    name: string;
    size: number;
    createdAt: number;
    expiresAt?: number;
    encrypted: boolean;
  };
  onDelete: () => void;
  onShare: () => void;
  onP2PTransfer: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onDelete,
  onShare,
  onP2PTransfer
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getExpirationText = () => {
    if (!file.expiresAt) return 'Never expires';

    const now = Date.now();
    const diff = file.expiresAt - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return 'Expires soon';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.fileIcon}>
          <Ionicons
            name="document-outline"
            size={24}
            color={Colors.primary}
          />
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
          <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
        </View>
        <EncryptionBadge encrypted={file.encrypted} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
          <Text style={styles.detailText}>Added: {formatDate(file.createdAt)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={Colors.gray} />
          <Text style={styles.detailText}>{getExpirationText()}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onP2PTransfer}>
          <Ionicons name="wifi-outline" size={20} color={Colors.success} />
          <Text style={[styles.actionText, { color: Colors.success }]}>P2P</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },
  details: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: Colors.gray,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});
