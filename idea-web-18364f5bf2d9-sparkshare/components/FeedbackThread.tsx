import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, IconButton } from 'react-native-paper';
import { Feedback } from '../lib/types';

interface FeedbackThreadProps {
  feedback: Feedback;
  onUpvote: () => void;
  onDownvote: () => void;
}

const FeedbackThread = ({ feedback, onUpvote, onDownvote }: FeedbackThreadProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={32} label={feedback.username?.substring(0, 2).toUpperCase() || 'U'} />
        <View style={styles.userInfo}>
          <Text variant="titleSmall">{feedback.username || 'Anonymous'}</Text>
          <Text variant="bodySmall">{new Date(feedback.created_at).toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.content}>{feedback.content}</Text>

      <View style={styles.footer}>
        <View style={styles.voteContainer}>
          <IconButton
            icon="arrow-up"
            size={16}
            onPress={onUpvote}
            style={styles.voteButton}
          />
          <Text>{feedback.upvotes || 0}</Text>
          <IconButton
            icon="arrow-down"
            size={16}
            onPress={onDownvote}
            style={styles.voteButton}
          />
          <Text>{feedback.downvotes || 0}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    marginLeft: 8,
  },
  content: {
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    margin: 0,
  },
});

export default FeedbackThread;
