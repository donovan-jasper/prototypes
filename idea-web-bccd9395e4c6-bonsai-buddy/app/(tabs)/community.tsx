import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Button, Portal, Modal, useTheme, IconButton } from 'react-native-paper';
import { useCommunity } from '../../hooks/useCommunity';
import CommunityPost from '../../components/CommunityPost';
import { useAppContext } from '../../contexts/AppContext';
import { useRouter } from 'expo-router';

export default function CommunityScreen() {
  const { posts, loading, loadPosts, refreshPosts } = useCommunity();
  const { isPremium } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  };

  const handleUpgrade = () => {
    setShowPaywall(false);
    router.push('/upgrade');
  };

  const handlePost = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    router.push('/post/create');
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : posts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="headlineMedium">No posts yet!</Text>
          <Text variant="bodyMedium">Be the first to share your plant journey</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <CommunityPost post={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {!isPremium && (
        <Portal>
          <Modal
            visible={showPaywall}
            onDismiss={() => setShowPaywall(false)}
            contentContainerStyle={styles.paywallModal}
          >
            <View style={styles.paywallContent}>
              <Text variant="headlineMedium" style={styles.paywallTitle}>
                Unlock Full Community Access
              </Text>
              <Text variant="bodyMedium" style={styles.paywallText}>
                Share your plant journey, comment on posts, and connect with other plant lovers.
              </Text>
              <Button
                mode="contained"
                onPress={handleUpgrade}
                style={styles.upgradeButton}
              >
                Upgrade to Premium
              </Button>
              <Button
                mode="text"
                onPress={() => setShowPaywall(false)}
                style={styles.dismissButton}
              >
                Continue Browsing
              </Button>
            </View>
          </Modal>
        </Portal>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handlePost}
      >
        <IconButton
          icon="plus"
          color="white"
          size={24}
          onPress={handlePost}
        />
      </TouchableOpacity>
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
    padding: 24,
  },
  list: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paywallModal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 8,
  },
  paywallContent: {
    alignItems: 'center',
  },
  paywallTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  paywallText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  upgradeButton: {
    marginBottom: 12,
    width: '100%',
  },
  dismissButton: {
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
