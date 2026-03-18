import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCourseStore } from '../../../store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

export default function LessonEditorScreen() {
  const { lessonId, courseId } = useLocalSearchParams<{ lessonId: string; courseId: string }>();
  const courses = useCourseStore((state) => state.courses);
  const updateLesson = useCourseStore((state) => state.updateLesson);
  const deleteLesson = useCourseStore((state) => state.deleteLesson);

  const course = courses.find((c) => c.id === courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);

  const [title, setTitle] = useState(lesson?.title || '');
  const [content, setContent] = useState(lesson?.content || '');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setContent(lesson.content);
    }
  }, [lesson]);

  if (!course || !lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color="#C7C7CC" />
          <Text style={styles.errorTitle}>Lesson not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleTitleChange = (text: string) => {
    setTitle(text);
    updateLesson(courseId, lessonId, { title: text });
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    updateLesson(courseId, lessonId, { content: text });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteLesson(courseId, lessonId);
            router.back();
          },
        },
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
          onPress={() => router.back()}
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
            onChangeText={handleTitleChange}
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
              onChangeText={handleContentChange}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    padding: 16,
  },
  editorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 400,
  },
  contentInput: {
    fontSize: 16,
    color: '#000000',
    padding: 16,
    minHeight: 400,
    lineHeight: 24,
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 16,
    minHeight: 400,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  previewHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  emptyPreview: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 32,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

const markdownStyles = {
  body: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  heading1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
  },
  strong: {
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  list_item: {
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: '#F2F2F7',
    color: '#FF3B30',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  code_block: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  blockquote: {
    backgroundColor: '#F2F2F7',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
};
