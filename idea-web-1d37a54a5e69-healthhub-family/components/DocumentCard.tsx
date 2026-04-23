import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Document } from '../types';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onPress: () => void;
  onDelete?: () => void;
  showAttachButton?: boolean;
}

export default function DocumentCard({ document, onPress, onDelete, showAttachButton = false }: DocumentCardProps) {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return 'image-outline';
    if (type.includes('pdf')) return 'document-outline';
    return 'document-text-outline';
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={getFileIcon(document.type)} size={24} color={Colors.light.tint} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{document.title}</Text>
        <Text style={styles.date}>
          {format(new Date(document.uploadDate), 'MMM d, yyyy')}
        </Text>
      </View>

      {showAttachButton ? (
        <TouchableOpacity onPress={onPress} style={styles.attachButton}>
          <Ionicons name="attach-outline" size={20} color={Colors.light.tint} />
        </TouchableOpacity>
      ) : onDelete ? (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color={Colors.light.danger} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  attachButton: {
    padding: 8,
  },
});
