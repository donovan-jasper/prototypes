import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Portal, Modal, useTheme, IconButton, FAB } from 'react-native-paper';
import { useCommunity } from '../../hooks/useCommunity';
import CommunityPost from '../../components/CommunityPost';
import { useAppContext } from '../../contexts/AppContext';
import { useRouter } from 'expo-router';

export default function CommunityScreen() {
  const { posts, loading, loadPosts, refreshPosts, createPost } = useCommunity();
  const { isPremium, userId } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
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
    setShowCreatePost(true);
  };

  const handleCreatePost = async (photoUri: string, caption: string) => {
    try {
      await createPost({
        userId,
        plantId: '', // Will be set in the post creation screen
        photoUri,
        caption,
        likes: 0,
        createdAt: new Date().toISOString()
      });
      setShowCreatePost(false);
      await refreshPosts();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
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

      {isPremium && (
        <Portal>
          <Modal
            visible={showCreatePost}
            onDismiss={() => setShowCreatePost(false)}
            contentContainerStyle={styles.createPostModal}
          >
            <CreatePostForm
              onSubmit={handleCreatePost}
              onCancel={() => setShowCreatePost(false)}
            />
          </Modal>
        </Portal>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handlePost}
        color="white"
      />
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
  createPostModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4caf50',
  },
});

function CreatePostForm({ onSubmit, onCancel }: { onSubmit: (photoUri: string, caption: string) => void, onCancel: () => void }) {
  const [photoUri, setPhotoUri] = useState('');
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!photoUri) {
      Alert.alert('Error', 'Please take a photo first');
      return;
    }
    onSubmit(photoUri, caption);
  };

  return (
    <View style={styles.formContainer}>
      <Text variant="headlineSmall" style={styles.formTitle}>Create Post</Text>

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text>No photo selected</Text>
        </View>
      )}

      <Button
        mode="outlined"
        onPress={handleTakePhoto}
        style={styles.photoButton}
        loading={isLoading}
        disabled={isLoading}
      >
        Take Photo
      </Button>

      <TextInput
        label="Caption"
        value={caption}
        onChangeText={setCaption}
        multiline
        numberOfLines={3}
        style={styles.captionInput}
      />

      <View style={styles.formActions}>
        <Button mode="text" onPress={onCancel} style={styles.cancelButton}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!photoUri}
          style={styles.submitButton}
        >
          Post
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 16,
  },
  formTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButton: {
    marginBottom: 16,
  },
  captionInput: {
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#4caf50',
  },
});
