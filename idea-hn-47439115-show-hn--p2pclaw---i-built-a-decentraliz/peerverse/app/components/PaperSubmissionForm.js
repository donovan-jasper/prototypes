import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

const PaperSubmissionForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [authorsError, setAuthorsError] = useState('');
  const [abstractError, setAbstractError] = useState('');
  const [contentError, setContentError] = useState('');

  const validateForm = () => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError('Please enter a title');
      isValid = false;
    } else {
      setTitleError('');
    }

    if (!authors.trim()) {
      setAuthorsError('Please enter at least one author');
      isValid = false;
    } else {
      setAuthorsError('');
    }

    if (!abstract.trim()) {
      setAbstractError('Please enter an abstract');
      isValid = false;
    } else if (abstract.trim().length < 200) {
      setAbstractError('Abstract should be at least 200 characters');
      isValid = false;
    } else {
      setAbstractError('');
    }

    if (!content.trim()) {
      setContentError('Please enter paper content');
      isValid = false;
    } else if (content.trim().length < 500) {
      setContentError('Content should be at least 500 characters');
      isValid = false;
    } else {
      setContentError('');
    }

    if (!isValid) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit({
      title,
      authors,
      abstract,
      content
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={[styles.input, titleError && styles.inputError]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter paper title"
          autoCapitalize="words"
          returnKeyType="next"
        />
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

        <Text style={styles.label}>Authors</Text>
        <TextInput
          style={[styles.input, authorsError && styles.inputError]}
          value={authors}
          onChangeText={setAuthors}
          placeholder="Enter authors (comma separated)"
          autoCapitalize="words"
          returnKeyType="next"
        />
        {authorsError ? <Text style={styles.errorText}>{authorsError}</Text> : null}

        <Text style={styles.label}>Abstract</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, abstractError && styles.inputError]}
          value={abstract}
          onChangeText={setAbstract}
          placeholder="Enter abstract (200-300 words)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          returnKeyType="next"
        />
        {abstractError ? <Text style={styles.errorText}>{abstractError}</Text> : null}

        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, styles.contentInput, contentError && styles.inputError]}
          value={content}
          onChangeText={setContent}
          placeholder="Enter full paper content"
          multiline
          numberOfLines={15}
          textAlignVertical="top"
        />
        {contentError ? <Text style={styles.errorText}>{contentError}</Text> : null}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title || !authors || !abstract || !content) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!title || !authors || !abstract || !content}
        >
          <Text style={styles.submitButtonText}>Submit Paper</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  multilineInput: {
    height: 120,
  },
  contentInput: {
    height: 250,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaperSubmissionForm;
