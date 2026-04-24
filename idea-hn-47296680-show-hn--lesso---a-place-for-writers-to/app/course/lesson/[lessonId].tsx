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
              autoCapitalize="sentences"
              autoCorrect
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = {
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#000000',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#000000',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#000000',
  },
  heading4: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    color: '#000000',
  },
  heading5: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 2,
    color: '#000000',
  },
  heading6: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    color: '#000000',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    marginBottom: 8,
  },
  list_item: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    marginBottom: 4,
  },
  bullet_list: {
    marginLeft: 20,
    marginBottom: 8,
  },
  ordered_list: {
    marginLeft: 20,
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    padding: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  code_block: {
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  fence: {
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  blockquote: {
    backgroundColor: '#F2F2F7',
    borderLeftWidth: 4,
    borderLeftColor: '#C7C7CC',
    paddingLeft: 12,
    marginVertical: 8,
    paddingVertical: 8,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7CC',
    marginVertical: 16,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  image: {
    marginVertical: 8,
    alignSelf: 'center',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
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
    fontWeight: 'bold',
    color: '#000000',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  editorContainer: {
    flex: 1,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
    minHeight: 300,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewHeaderText: {
    fontSize: 15,
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
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
});
