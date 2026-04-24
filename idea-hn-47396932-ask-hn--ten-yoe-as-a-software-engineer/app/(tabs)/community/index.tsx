import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Button, Alert } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../../../firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  isAnswered: boolean;
  createdAt: Date;
}

const CommunityScreen = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    author: 'Anonymous'
  });

  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const questionsData: Question[] = [];
      querySnapshot.forEach((doc) => {
        questionsData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate()
        } as Question);
      });
      setQuestions(questionsData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions. Please check your connection.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpvote = async (questionId: string) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        upvotes: increment(1)
      });
    } catch (err) {
      console.error('Error upvoting question:', err);
      Alert.alert('Error', 'Failed to upvote. Please try again.');
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.title || !newQuestion.content) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'questions'), {
        ...newQuestion,
        upvotes: 0,
        isAnswered: false,
        createdAt: serverTimestamp()
      });
      setNewQuestion({ title: '', content: '', author: 'Anonymous' });
      setLoading(false);
    } catch (err) {
      console.error('Error submitting question:', err);
      Alert.alert('Error', 'Failed to submit question. Please try again.');
      setLoading(false);
    }
  };

  if (loading && questions.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading community questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community Q&A</Text>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Ask a Question</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={newQuestion.title}
          onChangeText={(text) => setNewQuestion({...newQuestion, title: text})}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Content"
          multiline
          numberOfLines={4}
          value={newQuestion.content}
          onChangeText={(text) => setNewQuestion({...newQuestion, content: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Name (optional)"
          value={newQuestion.author}
          onChangeText={(text) => setNewQuestion({...newQuestion, author: text || 'Anonymous'})}
        />
        <Button
          title="Submit Question"
          onPress={handleSubmitQuestion}
          disabled={loading}
        />
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>{item.title}</Text>
            <Text style={styles.questionContent}>{item.content}</Text>
            <View style={styles.questionFooter}>
              <Text style={styles.authorText}>Posted by: {item.author}</Text>
              <View style={styles.upvoteContainer}>
                <TouchableOpacity onPress={() => handleUpvote(item.id)}>
                  <Text style={styles.upvoteText}>↑ {item.upvotes}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text>No questions yet. Be the first to ask!</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  questionContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 14,
    color: '#888',
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default CommunityScreen;
