import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Lesson } from '../types';

interface LessonEditorProps {
  lesson: Lesson;
  onSave: (updates: Partial<Lesson>) => void;
  onDelete: () => void;
  onBack: () => void;
}

const LessonEditor: React.FC<LessonEditorProps> = ({ lesson, onSave, onDelete, onBack }) => {
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content || '');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setTitle(lesson.title);
    setContent(lesson.content || '');
  }, [lesson]);

  const handleSave = () => {
    onSave({
      title,
      content
    });
    Alert.alert('Success', 'Lesson saved successfully');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowPreview(!showPreview)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPreview ? 'create-outline' : 'eye-outline'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Lesson Title"
            placeholderTextColor="#C7C7CC"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="words"
          />
        </View>

        {showPreview ? (
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Ionicons name="eye" size={20} color="#8E8E93" />
              <Text style={styles.previewHeaderText}>Preview</Text>
            </View>
            {content.trim() ? (
              <Markdown style={markdownStyles}>{content}</Markdown>
            ) : (
              <Text style={styles.emptyPreview}>
                Start writing to see the preview
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.editorContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder="Write your lesson content in Markdown...

# Heading 1
## Heading 2

**Bold text**
*Italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item"
              placeholderTextColor="#C7C7CC"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={20}
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const markdownStyles = {
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#1C1C1E',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#1C1C1E',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#1C1C1E',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  list: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1C1C1E',
    marginLeft: 8,
  },
  blockquote: {
    backgroundColor: '#F2F2F7',
    borderLeftColor: '#007AFF',
    borderLeftWidth: 4,
    padding: 12,
    marginVertical: 8,
  },
  code: {
    backgroundColor: '#F2F2F7',
    padding: 4,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D1D6',
    backgroundColor: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  saveButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  editorContainer: {
    flex: 1,
  },
  contentInput: {
    fontSize: 16,
    color: '#1C1C1E',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    minHeight: 300,
    textAlignVertical: 'top',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  emptyPreview: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default LessonEditor;
