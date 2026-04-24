import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getQuestions } from '../../../utils/api';

type Question = {
  id: string;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  isAnswered: boolean;
  createdAt: Date;
};

const QuestionList = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions();
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const renderQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity
      style={[
        styles.questionCard,
        item.isAnswered ? styles.answered : styles.unanswered
      ]}
      onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
    >
      <View style={styles.questionHeader}>
        <Text style={styles.questionTitle}>{item.title}</Text>
        <View style={styles.upvoteContainer}>
          <Ionicons name="arrow-up-circle" size={20} color="#4CAF50" />
          <Text style={styles.upvoteCount}>{item.upvotes}</Text>
        </View>
      </View>
      <Text style={styles.questionAuthor}>Posted by: {item.author}</Text>
      <Text style={styles.questionStatus}>
        {item.isAnswered ? 'Answered' : 'Unanswered'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewQuestion')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  questionCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  answered: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  unanswered: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  upvoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4CAF50',
  },
  questionAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  questionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default QuestionList;
