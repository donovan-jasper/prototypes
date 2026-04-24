import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { FAB } from 'react-native-paper';
import { db } from '../../../utils/api';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

const CommunityScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const questionsData = [];
      querySnapshot.forEach((doc) => {
        questionsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setQuestions(questionsData);
      setLoading(false);
    }, (error) => {
      setError('Failed to load questions. Please check your connection.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'questions'), {
        question: newQuestion.trim(),
        answer: 'This question is awaiting an answer...',
        createdAt: serverTimestamp(),
        status: 'unanswered',
        upvotes: 0
      });
      setNewQuestion('');
      setShowForm(false);
    } catch (error) {
      console.error('Error adding question: ', error);
      setError('Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (questionId) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        upvotes: increment(1)
      });
    } catch (error) {
      console.error('Error upvoting question: ', error);
      Alert.alert('Error', 'Failed to upvote question. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{item.question}</Text>
      <Text style={styles.answerText}>{item.answer}</Text>
      <View style={styles.questionFooter}>
        <Text style={[
          styles.statusText,
          item.status === 'answered' ? styles.answered : styles.unanswered
        ]}>
          {item.status === 'answered' ? 'Answered' : 'Unanswered'}
        </Text>
        <TouchableOpacity onPress={() => handleUpvote(item.id)} style={styles.upvoteButton}>
          <Text style={styles.upvoteText}>↑ {item.upvotes || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Community Q&A</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={questions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No questions yet. Be the first to ask!</Text>
          </View>
        }
      />

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask your question..."
            value={newQuestion}
            onChangeText={setNewQuestion}
            multiline
            editable={!submitting}
            placeholderTextColor="#999"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowForm(false)}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleAddQuestion}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowForm(true)}
        disabled={submitting}
        color="#6200ee"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  list: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  answered: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  unanswered: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteText: {
    fontSize: 14,
    color: '#6200ee',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  formContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#6200ee',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
});

export default CommunityScreen;
