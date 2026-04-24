import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const PaperSubmissionForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title || !authors || !abstract || !content) {
      alert('Please fill in all fields');
      return;
    }

    onSubmit({
      title,
      authors: authors.split(',').map(author => author.trim()),
      abstract,
      content,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter paper title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Authors (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={authors}
          onChangeText={setAuthors}
          placeholder="John Doe, Jane Smith"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Abstract</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={abstract}
          onChangeText={setAbstract}
          placeholder="Enter abstract"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={content}
          onChangeText={setContent}
          placeholder="Enter full paper content"
          multiline
          numberOfLines={10}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Paper</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaperSubmissionForm;
