import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DuplicateCard } from '../../components/DuplicateCard';
import { getDuplicates } from '../../database/queries';
import { useMediaStore } from '../../store/mediaStore';

export default function DuplicatesScreen() {
  const navigation = useNavigation();
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { loadMedia } = useMediaStore();

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    try {
      const foundDuplicates = await getDuplicates();
      setDuplicates(foundDuplicates);
      setLoading(false);
    } catch (error) {
      console.error('Error loading duplicates:', error);
      setLoading(false);
    }
  };

  const handleDuplicateResolved = async () => {
    if (currentIndex < duplicates.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All duplicates resolved
      setDuplicates([]);
      setCurrentIndex(0);
    }
    await loadMedia(); // Refresh media after resolution
    await loadDuplicates(); // Refresh duplicates list
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (duplicates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No duplicates found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Gallery</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Duplicate Photos</Text>
        <Text style={styles.counter}>
          {currentIndex + 1} of {duplicates.length} duplicates
        </Text>
      </View>

      <FlatList
        data={duplicates}
        keyExtractor={(item, index) => `duplicate-${index}`}
        renderItem={({ item, index }) => (
          <View style={index === currentIndex ? styles.visibleCard : styles.hiddenCard}>
            <DuplicateCard
              duplicates={item.matches}
              onResolve={handleDuplicateResolved}
            />
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
          setCurrentIndex(index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  counter: {
    fontSize: 16,
    color: '#666',
  },
  visibleCard: {
    width: '100%',
  },
  hiddenCard: {
    width: '100%',
    opacity: 0,
    position: 'absolute',
  },
});
