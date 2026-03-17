import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getIdeaById } from '../../lib/ideas';
import { getFeedbackByIdeaId, createFeedback } from '../../lib/feedback';
import { upvoteIdea, downvoteIdea, getUserVote } from '../../lib/votes';
import CategoryBadge from '../../components/CategoryBadge';

export default function IdeaDetail() {
  const { id } = useLocalSearchParams();
  const [idea, setIdea] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState(null);
  const userId = 1; // Mock user ID

  useEffect(() => {
    const fetchIdea = async () => {
      const ideaData = await getIdeaById(id);
      setIdea(ideaData);
      setUpvotes(ideaData.upvotes || 0);
      setDownvotes(ideaData.downvotes || 0);
    };
    fetchIdea();
  }, [id]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const feedbackData = await getFeedbackByIdeaId(id);
      setFeedback(feedbackData);
    };
    fetchFeedback();
  }, [id]);

  useEffect(() => {
    const fetchUserVote = async () => {
      const vote = await getUserVote(id, userId);
      setUserVote(vote);
    };
    fetchUserVote();
  }, [id]);

  const handleUpvote = async () => {
    // Optimistic update
    if (userVote === 'upvote') {
      setUpvotes(upvotes - 1);
      setUserVote(null);
    } else if (userVote === 'downvote') {
      setUpvotes(upvotes + 1);
      setDownvotes(downvotes - 1);
      setUserVote('upvote');
    } else {
      setUpvotes(upvotes + 1);
      setUserVote('upvote');
    }

    try {
      await upvoteIdea(id, userId);
    } catch (error) {
      // Revert on error
      const ideaData = await getIdeaById(id);
      setUpvotes(ideaData.upvotes || 0);
      setDownvotes(ideaData.downvotes || 0);
      const vote = await getUserVote(id, userId);
      setUserVote(vote);
    }
  };

  const handleDownvote = async () => {
    // Optimistic update
    if (userVote === 'downvote') {
      setDownvotes(downvotes - 1);
      setUserVote(null);
    } else if (userVote === 'upvote') {
      setDownvotes(downvotes + 1);
      setUpvotes(upvotes - 1);
      setUserVote('downvote');
    } else {
      setDownvotes(downvotes + 1);
      setUserVote('downvote');
    }

    try {
      await downvoteIdea(id, userId);
    } catch (error) {
      // Revert on error
      const ideaData = await getIdeaById(id);
      setUpvotes(ideaData.upvotes || 0);
      setDownvotes(ideaData.downvotes || 0);
      const vote = await getUserVote(id, userId);
      setUserVote(vote);
    }
  };

  const handleSubmitFeedback = async () => {
    await createFeedback({ ideaId: id, comment: newComment });
    setNewComment('');
    const feedbackData = await getFeedbackByIdeaId(id);
    setFeedback(feedbackData);
  };

  if (!idea) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{idea.title}</Text>
      <CategoryBadge category={idea.category} />
      <Text style={styles.description}>{idea.description}</Text>
      
      <View style={styles.voteSection}>
        <TouchableOpacity onPress={handleUpvote} style={styles.voteButton}>
          <MaterialIcons 
            name="thumb-up" 
            size={28} 
            color={userVote === 'upvote' ? '#4285F4' : '#666'} 
          />
          <Text style={[styles.voteCount, userVote === 'upvote' && styles.activeVote]}>
            {upvotes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDownvote} style={styles.voteButton}>
          <MaterialIcons 
            name="thumb-down" 
            size={28} 
            color={userVote === 'downvote' ? '#EA4335' : '#666'} 
          />
          <Text style={[styles.voteCount, userVote === 'downvote' && styles.activeVote]}>
            {downvotes}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Feedback ({feedback.length})</Text>
        {feedback.map((item) => (
          <View key={item.id} style={styles.feedbackItem}>
            <Text>{item.comment}</Text>
          </View>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Add your feedback"
        value={newComment}
        onChangeText={setNewComment}
        multiline
      />
      <Button title="Submit Feedback" onPress={handleSubmitFeedback} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginVertical: 15,
    lineHeight: 24,
  },
  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteCount: {
    fontSize: 18,
    color: '#666',
  },
  activeVote: {
    fontWeight: 'bold',
    color: '#000',
  },
  feedbackContainer: {
    marginVertical: 20,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedbackItem: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    textAlignVertical: 'top',
  },
});
