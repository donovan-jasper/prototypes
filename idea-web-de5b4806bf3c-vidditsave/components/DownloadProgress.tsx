import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import CollectionPicker from './CollectionPicker';

interface DownloadProgressProps {
  visible: boolean;
  progress: number;
  message: string;
  itemId?: number;
  onClose: () => void;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  visible,
  progress,
  message,
  itemId,
  onClose,
}) => {
  const [showCollectionPicker, setShowCollectionPicker] = React.useState(false);
  const { updateItem } = useStore();

  const handleCollectionSelect = (collectionId: number) => {
    if (itemId) {
      updateItem(itemId, { collectionId });
    }
    setShowCollectionPicker(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{message}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowCollectionPicker(true)}
            >
              <Ionicons name="folder-outline" size={20} color="#007AFF" />
              <Text style={styles.actionText}>Add to Collection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="#FF3B30" />
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CollectionPicker
        visible={showCollectionPicker}
        onSelect={handleCollectionSelect}
        onClose={() => setShowCollectionPicker(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
});

export default DownloadProgress;
