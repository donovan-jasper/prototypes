import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { useCommunity } from '../hooks/useCommunity';

export default function CommunityPost({ post }: { post: any }) {
  const { likePost } = useCommunity();

  return (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: post.photoUri }} />
      <Card.Content>
        <Text variant="bodyMedium">{post.caption}</Text>
        <View style={styles.actions}>
          <IconButton icon="heart" onPress={() => likePost(post.id)} />
          <Text>{post.likes} likes</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
