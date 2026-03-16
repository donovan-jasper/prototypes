import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getIdeaById } from '../../lib/ideas';
import { getFeedbackByIdeaId, createFeedback } from '../../lib/feedback';

export default function IdeaDetail() {
  const { id } = useLocalSearchParams();
  const [idea, setIdea] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchIdea = async () => {
      const ideaData = await getIdeaById(id);
      setIdea(ideaData);
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
      <Text style={styles.description}>{idea.description}</Text>
      <Text style={styles.category}>Category: {idea.category}</Text>
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Feedback</Text>
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
      />
      <Button title="Submit Feedback" onPress={handleSubmitFeedback} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
  },
  category: {
    fontSize: 14,
    color: 'gray',
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
});
