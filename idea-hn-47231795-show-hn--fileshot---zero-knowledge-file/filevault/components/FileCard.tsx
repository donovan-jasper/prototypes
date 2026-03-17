import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import EncryptionBadge from './EncryptionBadge';
import { Colors } from '@/constants/Colors';

const FileCard = ({ file, onDelete }) => {
  const formatSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (hours) => {
    if (hours < 1) return `${Math.floor(hours * 60)} minutes`;
    if (hours < 24) return `${hours} hours`;
    return `${Math.floor(hours / 24)} days`;
  };

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{file.name}</Text>
        <Text style={styles.size}>{formatSize(file.size)}</Text>
        <Text style={styles.expires}>Expires in: {formatTime(file.expiresIn)}</Text>
        <EncryptionBadge />
      </View>
      <IconButton
        icon="delete"
        size={20}
        onPress={() => onDelete(file.id)}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  size: {
    fontSize: 14,
    color: Colors.light.text,
  },
  expires: {
    fontSize: 12,
    color: Colors.light.text,
  },
});

export default FileCard;
