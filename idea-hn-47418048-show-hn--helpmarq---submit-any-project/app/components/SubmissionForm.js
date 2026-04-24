import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker } from 'react-native';
import { validateSubmission } from '../utils/submission';
import { getTemplateQuestions } from '../utils/templates';

const SubmissionForm = ({ onSubmit }) => {
  const [template, setTemplate] = useState('');
  const [file, setFile] = useState('');
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const handleTemplateChange = (selectedTemplate) => {
    setTemplate(selectedTemplate);
    setQuestions(getTemplateQuestions(selectedTemplate));
    setAnswers({});
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    if (validateSubmission({ type: template, file })) {
      onSubmit({ type: template, file, questions, answers });
    } else {
      setError('Invalid submission');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Template</Text>
      <Picker
        selectedValue={template}
        style={styles.picker}
        onValueChange={handleTemplateChange}
      >
        <Picker.Item label="Select a template" value="" />
        <Picker.Item label="Logo Review" value="Logo Review" />
        <Picker.Item label="Pitch Deck" value="Pitch Deck" />
        <Picker.Item label="Portfolio Review" value="Portfolio Review" />
      </Picker>

      {template && (
        <>
          <Text style={styles.label}>File</Text>
          <TextInput
            style={styles.input}
            value={file}
            onChangeText={setFile}
            placeholder="e.g., test.png"
          />

          <Text style={styles.sectionTitle}>Questions for this template:</Text>
          {questions.map((question) => (
            <View key={question.id} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
              {question.type === 'rating' && (
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Text
                      key={rating}
                      style={[
                        styles.ratingOption,
                        answers[question.id] === rating && styles.selectedRating
                      ]}
                      onPress={() => handleAnswerChange(question.id, rating)}
                    >
                      {rating}
                    </Text>
                  ))}
                </View>
              )}
              {question.type === 'text' && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Your answer..."
                  multiline
                  value={answers[question.id] || ''}
                  onChangeText={(text) => handleAnswerChange(question.id, text)}
                />
              )}
            </View>
          ))}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Submit" onPress={handleSubmit} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  questionContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  ratingOption: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  selectedRating: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  textInput: {
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginTop: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SubmissionForm;
