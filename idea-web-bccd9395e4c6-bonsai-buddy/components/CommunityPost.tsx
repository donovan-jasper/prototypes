import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, Avatar, useTheme } from 'react-native-paper';
import { useCommunity } from '../hooks/useCommunity';
import { useAppContext } from '../contexts/AppContext';

export default function CommunityPost({ post }: { post: any }) {
  const { likePost, commentOnPost } = useCommunity();
  const { isPremium } = useAppContext();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const theme = useTheme();

  const handleLike = () => {
    if (!isPremium) {
      // Show paywall or toast message
      return;
    }
    likePost(post.id);
  };

  const handleComment = () => {
    if (!isPremium) {
      // Show paywall or toast message
      return;
    }
    if (commentText.trim()) {
      commentOnPost(post.id, commentText);
      setCommentText('');
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
              icon={post.liked ? "heart" : "heart-outline"}
              onPress={handleLike}
              size={20}
              iconColor={post.liked ? theme.colors.error : undefined}
            />
            <Text variant="bodySmall">{post.likes}</Text>
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
            {post.comments?.map((comment: any, index: number) => (
              <View key={index} style={styles.comment}>
                <Text variant="bodySmall" style={styles.commentUser}>{comment.userId}</Text>
                <Text variant="bodySmall">{comment.text}</Text>
              </View>
            ))}

            {isPremium && (
              <View style={styles.commentInput}>
                <TextInput
                  placeholder="Add a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  style={styles.input}
                />
                <IconButton
                  icon="send"
                  onPress={handleComment}
                  disabled={!commentText.trim()}
                />
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
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
});
