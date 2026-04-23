import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PhotoTimelineProps {
  photos: any[];
  onTakePhoto: () => void;
}

export default function PhotoTimeline({ photos, onTakePhoto }: PhotoTimelineProps) {
  const router = useRouter();

  const renderPhotoItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => router.push(`/photo/${item.id}`)}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.thumbnail}
      />
      <View style={styles.photoInfo}>
        <Text style={styles.photoDate}>
          {new Date(item.takenAt).toLocaleDateString()}
        </Text>
        {item.healthScore && (
          <View style={styles.healthScore}>
            <MaterialIcons
              name="favorite"
              size={14}
              color={item.healthScore >= 70 ? '#4CAF50' : '#F44336'}
            />
            <Text style={styles.healthScoreText}>{item.healthScore}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photo Timeline</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onTakePhoto}
        >
          <MaterialIcons name="add-a-photo" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Photo</Text>
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="photo-library" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>Add your first photo to track growth</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  photoItem: {
    marginRight: 12,
    width: 120,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  photoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  photoDate: {
    fontSize: 12,
    color: '#666',
  },
  healthScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScoreText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
});
