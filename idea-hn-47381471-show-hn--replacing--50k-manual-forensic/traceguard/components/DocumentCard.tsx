import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { format } from 'date-fns';

export function DocumentCard({ document, onDelete }) {
  const handleLongPress = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={handleLongPress}
    >
      <Image
        source={{ uri: document.uri }}
        style={styles.thumbnail}
      />
      <View style={styles.info}>
        <Text style={styles.date}>
          {format(new Date(document.uploadDate), 'MMM dd, yyyy')}
        </Text>
        <Text style={styles.text} numberOfLines={2}>
          {document.ocrText}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
  },
});
