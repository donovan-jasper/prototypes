import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getQuestions, submitQuestion } from '../../../utils/api';
import { Question } from '../../../types';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { firebaseConfig } from '../../../firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CommunityScreen = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // First try to get from Firebase
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
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Error fetching questions from Firebase:', err);
        setError('Failed to load questions. Using local data.');

        // Fallback to local data if Firebase fails
        try {
          const localQuestions = await getQuestions();
          setQuestions(localQuestions);
          setLoading(false);
        } catch (localErr) {
          console.error('Error fetching local questions:', localErr);
          setError('Failed to load questions. Please check your connection.');
          setLoading(false);
        }
      }
    };

    fetchQuestions();
  }, []);

  const handleUpvote = async (questionId: string) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        upvotes: increment(1)
      });
    } catch (err) {
      console.error('Error upvoting question:', err);
      setError('Failed to upvote. Please try again.');
    }
  };

  const seedFirebase = async () => {
    try {
      setLoading(true);
      const mockQuestions = await getQuestions();

      for (const question of mockQuestions) {
        await addDoc(collection(db, 'questions'), {
          ...question,
          createdAt: new Date(question.createdAt)
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error seeding Firebase:', err);
      setError('Failed to seed Firebase. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={seedFirebase}>
          <Text style={styles.retryButtonText}>Retry Seeding Firebase</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community Q&A</Text>

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
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CommunityScreen;
