import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, IconButton, Avatar, useTheme, TextInput, Button } from 'react-native-paper';
import { useCommunity } from '../hooks/useCommunity';
import { useAppContext } from '../contexts/AppContext';

export default function CommunityPost({ post }: { post: any }) {
  const { likePost, commentOnPost } = useCommunity();
  const { isPremium, userId } = useAppContext();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(post.liked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const theme = useTheme();

  const handleLike = async () => {
    if (!isPremium) {
      Alert.alert('Premium Feature', 'Upgrade to premium to like posts');
      return;
    }

    try {
      const newLikeCount = await likePost(post.id, userId);
      setIsLiked(!isLiked);
      setLikeCount(newLikeCount);
    } catch (error) {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleComment = async () => {
    if (!isPremium) {
      Alert.alert('Premium Feature', 'Upgrade to premium to comment');
      return;
    }

    if (commentText.trim()) {
      try {
        await commentOnPost(post.id, userId, commentText);
        setCommentText('');
      } catch (error) {
        Alert.alert('Error', 'Failed to post comment');
      }
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Avatar.Text size={40} label={post.userId.charAt(0).toUpperCase()} />
        <View style={styles.userInfo}>
          <Text variant="titleMedium">{post.userId}</Text>
          <Text variant="bodySmall">{new Date(post.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <Card.Cover source={{ uri: post.photoUri }} style={styles.image} />

      <Card.Content style={styles.content}>
        <Text variant="bodyMedium" style={styles.caption}>{post.caption}</Text>

        <View style={styles.actions}>
          <View style={styles.actionGroup}>
            <IconButton
              icon={isLiked ? "heart" : "heart-outline"}
              onPress={handleLike}
              size={20}
              iconColor={isLiked ? theme.colors.error : undefined}
            />
            <Text variant="bodySmall">{likeCount}</Text>
          </View>

          <View style={styles.actionGroup}>
            <IconButton
              icon="comment-outline"
              onPress={() => setShowComments(!showComments)}
              size={20}
            />
            <Text variant="bodySmall">{post.comments?.length || 0}</Text>
          </View>
        </View>

        {showComments && (
          <View style={styles.commentsSection}>
            {post.comments?.length > 0 ? (
              post.comments.map((comment: any, index: number) => (
                <View key={index} style={styles.comment}>
                  <Text variant="bodySmall" style={styles.commentUser}>{comment.userId}</Text>
                  <Text variant="bodySmall">{comment.text}</Text>
                </View>
              ))
            ) : (
              <Text variant="bodySmall" style={styles.noComments}>No comments yet. Be the first to comment!</Text>
            )}

            {isPremium && (
              <View style={styles.commentInput}>
                <TextInput
                  placeholder="Add a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  style={styles.input}
                  multiline
                />
                <Button
                  mode="contained"
                  onPress={handleComment}
                  disabled={!commentText.trim()}
                  style={styles.commentButton}
                >
                  Post
                </Button>
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    marginLeft: 12,
  },
  image: {
    height: 300,
  },
  content: {
    padding: 12,
  },
  caption: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  comment: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  noComments: {
    textAlign: 'center',
    marginVertical: 12,
    color: '#666',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  commentButton: {
    backgroundColor: '#4caf50',
  },
});
