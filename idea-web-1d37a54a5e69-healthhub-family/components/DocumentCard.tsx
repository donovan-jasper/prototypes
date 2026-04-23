import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document } from '../types';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onPress: () => void;
  onDelete: () => void;
}

export default function DocumentCard({ document, onPress, onDelete }: DocumentCardProps) {
  const isImage = document.type.includes('image');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        {isImage ? (
          <Image
            source={{ uri: document.fileUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="document-outline" size={24} color="#007AFF" />
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{document.title}</Text>
        <Text style={styles.date}>{format(new Date(document.uploadDate), 'MMM d, yyyy')}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={(e) => {
        e.stopPropagation();
        onDelete();
      }}>
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
});
