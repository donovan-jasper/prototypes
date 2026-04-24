import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker, TouchableOpacity, Image } from 'react-native';
import { validateSubmission } from '../utils/submission';
import { getTemplateQuestions } from '../utils/templates';
import * as ImagePicker from 'expo-image-picker';

const SubmissionForm = ({ onSubmit }) => {
  const [template, setTemplate] = useState('');
  const [file, setFile] = useState(null);
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFile(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!template) {
      setError('Please select a template');
      return;
    }

    if (!file) {
      setError('Please select a file');
      return;
    }

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
          <TouchableOpacity style={styles.fileButton} onPress={pickImage}>
            <Text style={styles.fileButtonText}>
              {file ? 'Change File' : 'Select File'}
            </Text>
          </TouchableOpacity>

          {file && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: file }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>
          )}

          <Text style={styles.sectionTitle}>Questions for this template:</Text>
          {questions.map((question) => (
            <View key={question.id} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
              {question.type === 'rating' && (
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingOption,
                        answers[question.id] === rating && styles.selectedRating
                      ]}
                      onPress={() => handleAnswerChange(question.id, rating)}
                    >
                      <Text style={styles.ratingText}>{rating}</Text>
                    </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  fileButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  fileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  questionContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  ratingOption: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    width: 40,
    alignItems: 'center',
  },
  selectedRating: {
    backgroundColor: '#4CAF50',
  },
  ratingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textInput: {
    height: 80,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SubmissionForm;
