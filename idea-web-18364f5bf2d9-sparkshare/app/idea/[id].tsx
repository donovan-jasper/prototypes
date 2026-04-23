import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { Text, Button, TextInput, Avatar, Divider, IconButton } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { getIdeaById, getFeedbackForIdea, addFeedback, upvoteFeedback, downvoteFeedback } from '../../lib/ideas';
import { getPotentialCollaborators } from '../../lib/matching';
import { useAuth } from '../../context/auth';
import { Idea, Feedback, UserProfile } from '../../lib/types';
import FeedbackThread from '../../components/FeedbackThread';
import CollaboratorCard from '../../components/CollaboratorCard';

const IdeaDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [potentialCollaborators, setPotentialCollaborators] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchIdeaData = async () => {
      try {
        if (typeof id === 'string') {
          const ideaId = parseInt(id);
          const [ideaData, feedbackData] = await Promise.all([
            getIdeaById(ideaId),
            getFeedbackForIdea(ideaId)
          ]);

          setIdea(ideaData);
          setFeedback(feedbackData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching idea data:', error);
        Alert.alert('Error', 'Failed to load idea details');
      }
    };

    fetchIdeaData();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !idea || !user) return;

    try {
      const comment: Feedback = {
        id: Date.now(), // Temporary ID
        idea_id: idea.id,
        user_id: user.id,
        content: newComment.trim(),
        created_at: new Date().toISOString(),
        parent_id: null
      };

      await addFeedback(comment);
      setFeedback(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleVote = async (feedbackId: number, voteType: 'up' | 'down') => {
    try {
      if (voteType === 'up') {
        await upvoteFeedback(feedbackId, user.id);
      } else {
        await downvoteFeedback(feedbackId, user.id);
      }

      // Update feedback in state
      setFeedback(prev => prev.map(f =>
        f.id === feedbackId ? {
          ...f,
          upvotes: voteType === 'up' ? (f.upvotes || 0) + 1 : f.upvotes,
          downvotes: voteType === 'down' ? (f.downvotes || 0) + 1 : f.downvotes
        } : f
      ));
    } catch (error) {
      console.error('Error voting on feedback:', error);
      Alert.alert('Error', 'Failed to vote on feedback');
    }
  };

  const handleShowCollaborators = async () => {
    if (!idea) return;

    try {
      const collaborators = await getPotentialCollaborators(user.id, idea.id);
      setPotentialCollaborators(collaborators);
      setShowCollaborators(true);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      Alert.alert('Error', 'Failed to load potential collaborators');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading idea details...</Text>
      </View>
    );
  }

  if (!idea) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Idea not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">{idea.title}</Text>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{idea.category}</Text>
        </View>
      </View>

      <Text variant="bodyMedium" style={styles.description}>
        {idea.description}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text variant="titleMedium">{idea.upvotes || 0}</Text>
          <Text variant="bodySmall">Upvotes</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="titleMedium">{idea.downvotes || 0}</Text>
          <Text variant="bodySmall">Downvotes</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="titleMedium">{feedback.length}</Text>
          <Text variant="bodySmall">Comments</Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium">Feedback</Text>

        <View style={styles.commentInputContainer}>
          <TextInput
            label="Add a comment"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            style={styles.commentInput}
          />
          <Button
            mode="contained"
            onPress={handleAddComment}
            disabled={!newComment.trim()}
            style={styles.commentButton}
          >
            Post
          </Button>
        </View>

        <FlatList
          data={feedback}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FeedbackThread
              feedback={item}
              onUpvote={() => handleVote(item.id, 'up')}
              onDownvote={() => handleVote(item.id, 'down')}
            />
          )}
          contentContainerStyle={styles.feedbackList}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text variant="titleMedium">Find Collaborators</Text>
        <Button
          mode="outlined"
          onPress={handleShowCollaborators}
          style={styles.collabButton}
        >
          Show Potential Collaborators
        </Button>

        {showCollaborators && (
          <FlatList
            data={potentialCollaborators}
            keyExtractor={(item) => item.user.id.toString()}
            renderItem={({ item }) => <CollaboratorCard profile={item} />}
            contentContainerStyle={styles.collaboratorList}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  categoryContainer: {
    marginTop: 8,
  },
  category: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  commentInputContainer: {
    marginTop: 16,
  },
  commentInput: {
    marginBottom: 8,
  },
  commentButton: {
    alignSelf: 'flex-end',
  },
  feedbackList: {
    paddingBottom: 16,
  },
  collabButton: {
    marginTop: 8,
  },
  collaboratorList: {
    marginTop: 16,
  },
});

export default IdeaDetailScreen;
