import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useMediaStore } from '../store/mediaStore';
import { deleteMedia, updateMedia } from '../database/queries';
import { CloudBadge } from './CloudBadge';

interface DuplicateCardProps {
  duplicates: {
    id: string;
    localPath: string;
    source: string;
    hash: string;
    cloudId: string;
  }[];
  onResolve: () => void;
}

export const DuplicateCard: React.FC<DuplicateCardProps> = ({ duplicates, onResolve }) => {
  const [isResolving, setIsResolving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { removeMedia } = useMediaStore();

  const handleKeepOne = async (keepId: string) => {
    setIsResolving(true);
    try {
      // Delete all duplicates except the one we're keeping
      for (const duplicate of duplicates) {
        if (duplicate.id !== keepId) {
          await deleteMedia(duplicate.id);
          removeMedia(duplicate.id);
        }
      }
      onResolve();
    } catch (error) {
      console.error('Error resolving duplicates:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleKeepAll = async () => {
    setIsResolving(true);
    try {
      // Just mark them as resolved without deleting
      onResolve();
    } finally {
      setIsResolving(false);
    }
  };

  if (duplicates.length < 2) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Duplicate Photos Found</Text>

      <View style={styles.comparisonContainer}>
        {duplicates.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.imageContainer,
              selectedId === item.id && styles.selectedContainer
            ]}
            onPress={() => setSelectedId(item.id)}
          >
            <Image
              source={{ uri: item.localPath }}
              style={styles.image}
              resizeMode="cover"
            />
            <CloudBadge source={item.source} style={styles.badge} />
            {selectedId === item.id && (
              <View style={styles.selectionOverlay}>
                <Text style={styles.selectionText}>Keep this one</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.keepOneButton]}
          onPress={() => selectedId && handleKeepOne(selectedId)}
          disabled={!selectedId || isResolving}
        >
          {isResolving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Keep Selected</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.keepAllButton]}
          onPress={handleKeepAll}
          disabled={isResolving}
        >
          {isResolving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Keep All</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#4CAF50',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    padding: 8,
  },
  selectionText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  keepOneButton: {
    backgroundColor: '#4CAF50',
  },
  keepAllButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
