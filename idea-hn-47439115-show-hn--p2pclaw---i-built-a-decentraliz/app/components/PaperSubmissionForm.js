import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const PaperSubmissionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    content: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.authors.trim()) {
      newErrors.authors = 'Authors are required';
    }

    if (!formData.abstract.trim()) {
      newErrors.abstract = 'Abstract is required';
    } else if (formData.abstract.length < 50) {
      newErrors.abstract = 'Abstract should be at least 50 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 200) {
      newErrors.content = 'Content should be at least 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={[styles.input, errors.title && styles.inputError]}
        value={formData.title}
        onChangeText={(text) => handleChange('title', text)}
        placeholder="Enter paper title"
      />
      {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

      <Text style={styles.label}>Authors</Text>
      <TextInput
        style={[styles.input, errors.authors && styles.inputError]}
        value={formData.authors}
        onChangeText={(text) => handleChange('authors', text)}
        placeholder="Enter authors (comma separated)"
      />
      {errors.authors && <Text style={styles.errorText}>{errors.authors}</Text>}

      <Text style={styles.label}>Abstract</Text>
      <TextInput
        style={[styles.input, styles.textArea, errors.abstract && styles.inputError]}
        value={formData.abstract}
        onChangeText={(text) => handleChange('abstract', text)}
        placeholder="Enter abstract (minimum 50 characters)"
        multiline
        numberOfLines={4}
      />
      {errors.abstract && <Text style={styles.errorText}>{errors.abstract}</Text>}

      <Text style={styles.label}>Content</Text>
      <TextInput
        style={[styles.input, styles.textArea, errors.content && styles.inputError]}
        value={formData.content}
        onChangeText={(text) => handleChange('content', text)}
        placeholder="Enter paper content (minimum 200 characters)"
        multiline
        numberOfLines={8}
      />
      {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Paper</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaperSubmissionForm;
