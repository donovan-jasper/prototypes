import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

interface Discussion {
  id: string;
  contentId: number;
  title: string;
  commentCount: number;
  lastActivity: number;
}

const CommunityScreen = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<any>();

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true);
    try {
      const discussionsRef = collection(db, 'discussions');
      const q = query(discussionsRef, orderBy('lastActivity', 'desc'));
      const querySnapshot = await getDocs(q);

      const fetchedDiscussions: Discussion[] = [];
      querySnapshot.forEach((doc) => {
        fetchedDiscussions.push({
          id: doc.id,
          ...doc.data()
        } as Discussion);
      });

      setDiscussions(fetchedDiscussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDiscussions();
    }, [fetchDiscussions])
  );

  const formatActivityTime = (timestamp: number) => {
    if (!timestamp) return 'No activity';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handlePress = (id: string, title: string, contentId: number) => {
    navigation.navigate('Thread', { discussionId: id, contentId, contentTitle: title });
  };

  const renderItem = ({ item }: { item: Discussion }) => (
    <TouchableOpacity
      onPress={() => handlePress(item.id, item.title, item.contentId)}
      style={styles.itemContainer}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.commentCount}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.itemSubtitle}>Last activity: {formatActivityTime(item.lastActivity)}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {discussions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No discussions yet</Text>
          <Text style={styles.emptySubtext}>Download content to start discussing</Text>
        </View>
      ) : (
        <FlatList
          data={discussions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 12,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default CommunityScreen;
