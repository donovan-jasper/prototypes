import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAllGifts, getGiftsByCategory, searchGifts } from '../../lib/gifts';
import { Gift } from '../../types';

const CATEGORIES = [
  { id: 'all', label: 'All Gifts' },
  { id: 'wellness', label: 'Spa & Wellness' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'experiences', label: 'Experiences' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadGifts();
  }, [selectedCategory]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchQuery.trim()) {
      const timeout = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      loadGifts();
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery]);

  const loadGifts = async () => {
    setLoading(true);
    try {
      let results: Gift[];
      if (selectedCategory === 'all') {
        results = await getAllGifts();
      } else {
        results = await getGiftsByCategory(selectedCategory);
      }
      setGifts(results);
    } catch (error) {
      console.error('Failed to load gifts:', error);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const results = await searchGifts(query);
      setGifts(results);
    } catch (error) {
      console.error('Search failed:', error);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const handleGiftPress = (giftId: number) => {
    router.push(`/gift/${giftId}`);
  };

  const handleQuickSend = (gift: Gift) => {
    router.push({
      pathname: '/gift/send',
      params: {
        giftId: gift.id.toString(),
        giftTitle: gift.title,
        giftPrice: gift.price.toString(),
      },
    });
  };

  const renderGiftCard = ({ item }: { item: Gift }) => (
    <TouchableOpacity
      style={styles.giftCard}
      onPress={() => handleGiftPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.giftImage} />
        ) : (
          <View style={[styles.giftImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>🎁</Text>
          </View>
        )}
      </View>
      <View style={styles.giftInfo}>
        <Text style={styles.giftTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.giftPrice}>${item.price.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.quickSendButton}
          onPress={(e) => {
            e.stopPropagation();
            handleQuickSend(item);
          }}
        >
          <Text style={styles.quickSendText}>Quick Send</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🎁</Text>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No gifts found' : 'No gifts available'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'Try a different search term'
          : 'Check back soon for new gift options'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Gifts</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search gifts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => handleCategorySelect(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading gifts...</Text>
        </View>
      ) : (
        <FlatList
          data={gifts}
          renderItem={renderGiftCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.giftList}
          columnWrapperStyle={styles.giftRow}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  giftList: {
    padding: 16,
  },
  giftRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  giftCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  giftImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
  },
  placeholderText: {
    fontSize: 48,
  },
  giftInfo: {
    padding: 12,
  },
  giftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    minHeight: 40,
  },
  giftPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  quickSendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickSendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
