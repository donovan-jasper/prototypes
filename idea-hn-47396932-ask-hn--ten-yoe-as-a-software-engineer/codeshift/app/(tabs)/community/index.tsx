import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { FAB } from 'react-native-paper';

const CommunityScreen = () => {
  const [questions, setQuestions] = useState([
    { id: '1', question: 'How to deploy a TensorFlow model on ESP32?', answer: 'You need to use TensorFlow Lite for Microcontrollers...' },
    { id: '2', question: 'Best Python libraries for embedded systems?', answer: 'Consider CircuitPython and MicroPython...' },
  ]);

  const [newQuestion, setNewQuestion] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, {
        id: Date.now().toString(),
        question: newQuestion,
        answer: 'This question is awaiting an answer...'
      }]);
      setNewQuestion('');
      setShowForm(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.questionCard}>
      <Text style={styles.questionText}>{item.question}</Text>
      <Text style={styles.answerText}>{item.answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Community Q&A</Text>

      <FlatList
        data={questions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      {showForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask your question..."
            value={newQuestion}
            onChangeText={setNewQuestion}
            multiline
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleAddQuestion}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowForm(true)}
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
  },
  answerText: {
    fontSize: 14,
    color: '#666',
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#6200ee',
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
    backgroundColor: '#6200ee',
  },
});

export default CommunityScreen;
