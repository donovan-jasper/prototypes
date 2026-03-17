import { View, FlatList, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { getAllManga } from '../../lib/db';
import { Manga } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReadingListScreen() {
  const router = useRouter();
  const [continueReading, setContinueReading] = useState<Manga[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadContinueReading = async () => {
    try {
      const allManga = await getAllManga();
      const inProgress = allManga
        .filter((m) => m.currentPage > 0)
        .sort((a, b) => b.lastRead - a.lastRead);
      setContinueReading(inProgress);
    } catch (error) {
      console.error('Failed to load reading list:', error);
    }
  };

  useEffect(() => {
    loadContinueReading();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContinueReading();
    setRefreshing(false);
  };

  const handleMangaPress = (manga: Manga) => {
    router.push(`/reader/${manga.id}`);
  };

  const renderContinueReadingItem = ({ item }: { item: Manga }) => {
    const progress = item.totalPages > 0 
      ? Math.round((item.currentPage / item.totalPages) * 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.continueItem}
        onPress={() => handleMangaPress(item)}
      >
        <Image
          source={{ uri: item.coverUri }}
          style={styles.continueCover}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <View style={styles.continueInfo}>
          <Text style={styles.continueTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.continueProgress}>
            Page {item.currentPage} of {item.totalPages}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={continueReading}
        keyExtractor={(item) => item.id}
        renderItem={renderContinueReadingItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
            {continueReading.length === 0 && (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No manga in progress</Text>
                <Text style={styles.emptySubtext}>
                  Start reading from your library to see them here
                </Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <View style={styles.listsSection}>
            <View style={styles.listsSectionHeader}>
              <Text style={styles.sectionTitle}>Reading Lists</Text>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            </View>
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>Custom lists coming soon</Text>
              <Text style={styles.emptySubtext}>
                Organize your manga into collections with Premium
              </Text>
            </View>
          </View>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    paddingBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  continueItem: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueCover: {
    width: 100,
    height: 140,
    backgroundColor: '#333',
  },
  continueInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  continueTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  continueProgress: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressPercent: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  listsSection: {
    marginTop: 32,
  },
  listsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
});
