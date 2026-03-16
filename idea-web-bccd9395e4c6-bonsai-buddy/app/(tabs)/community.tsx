import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useCommunity } from '../../hooks/useCommunity';
import CommunityPost from '../../components/CommunityPost';

export default function CommunityScreen() {
  const { posts, loading, loadPosts } = useCommunity();

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <View style={styles.container}>
      {posts.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text variant="headlineMedium">No posts yet!</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <CommunityPost post={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
});
