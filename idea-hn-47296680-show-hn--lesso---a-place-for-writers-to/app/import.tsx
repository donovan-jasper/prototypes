import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { extractContentFromURL, convertFileToText, splitContentIntoLessons } from '../lib/import';
import { useCourseStore } from '../store/courseStore';

type Tab = 'url' | 'file' | 'lessons';

interface ExtractedLesson {
  title: string;
  content: string;
}

export default function ImportScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedTitle, setExtractedTitle] = useState('');
  const [extractedBody, setExtractedBody] = useState('');
  const [lessons, setLessons] = useState<ExtractedLesson[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const createCourse = useCourseStore((state) => state.createCourse);
  const addLesson = useCourseStore((state) => state.addLesson);

  const handleFetchContent = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const result = await extractContentFromURL(url);
      setExtractedTitle(result.title);
      setExtractedBody(result.body);
      setShowPreview(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    setLoading(true);
    try {
      const result = await convertFileToText();
      setExtractedTitle(result.title);
      setExtractedBody(result.content);
      setShowPreview(true);
      setActiveTab('url'); // Switch to preview tab
    } catch (error) {
      if (error instanceof Error && error.message !== 'File selection cancelled') {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromContent = () => {
    const extractedLessons = splitContentIntoLessons(extractedBody);
    setLessons(extractedLessons);
    setActiveTab('lessons');
  };

  const handleLessonTitleChange = (index: number, newTitle: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[index].title = newTitle;
    setLessons(updatedLessons);
  };

  const handleCreateCourse = () => {
    if (lessons.length === 0) {
      Alert.alert('Error', 'No lessons to create');
      return;
    }

    createCourse({
      title: extractedTitle,
      description: `Imported course with ${lessons.length} lessons`,
      published: false,
    });

    const courses = useCourseStore.getState().courses;
    const newCourse = courses[courses.length - 1];

    lessons.forEach((lesson, index) => {
      addLesson(newCourse.id, {
        title: lesson.title,
        content: lesson.content,
        order: index,
      });
    });

    Alert.alert('Success', 'Course created successfully', [
      {
        text: 'OK',
        onPress: () => router.push(`/course/${newCourse.id}`),
      },
    ]);
  };

  const handleReset = () => {
    setUrl('');
    setExtractedTitle('');
    setExtractedBody('');
    setLessons([]);
    setShowPreview(false);
    setActiveTab('url');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import Content</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'url' && styles.activeTab]}
          onPress={() => setActiveTab('url')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="link-outline"
            size={20}
            color={activeTab === 'url' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'url' && styles.activeTabText]}>
            URL Import
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'file' && styles.activeTab]}
          onPress={() => setActiveTab('file')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="document-outline"
            size={20}
            color={activeTab === 'file' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'file' && styles.activeTabText]}>
            File Upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
          onPress={() => lessons.length > 0 && setActiveTab('lessons')}
          activeOpacity={0.7}
          disabled={lessons.length === 0}
        >
          <Ionicons
            name="list-outline"
            size={20}
            color={activeTab === 'lessons' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
            Lessons ({lessons.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'url' && (
          <View style={styles.tabContent}>
            {!showPreview ? (
              <>
                <Text style={styles.sectionTitle}>Import from URL</Text>
                <Text style={styles.sectionDescription}>
                  Paste a Substack, Medium, or blog post URL to extract content
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.urlInput}
                    placeholder="https://example.substack.com/p/article"
                    placeholderTextColor="#C7C7CC"
                    value={url}
                    onChangeText={setUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handleFetchContent}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Fetch Content</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.previewHeader}>
                  <Text style={styles.sectionTitle}>Content Preview</Text>
                  <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                    <Ionicons name="close-circle-outline" size={24} color="#8E8E93" />
                  </TouchableOpacity>
                </View>

                <View style={styles.previewCard}>
                  <Text style={styles.previewTitle}>{extractedTitle}</Text>
                  <ScrollView style={styles.previewBodyScroll} nestedScrollEnabled>
                    <Text style={styles.previewBody}>{extractedBody}</Text>
                  </ScrollView>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleCreateFromContent}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Create Course from This</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {activeTab === 'file' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Upload File</Text>
            <Text style={styles.sectionDescription}>
              Upload a PDF, TXT, or DOCX file to extract content
            </Text>

            <View style={styles.uploadArea}>
              <Ionicons name="cloud-upload-outline" size={64} color="#C7C7CC" />
              <Text style={styles.uploadText}>Choose a file to upload</Text>
              <Text style={styles.uploadSubtext}>PDF, TXT, or DOCX files supported</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleFileUpload}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="folder-open-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Choose File</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'lessons' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Edit Lessons</Text>
            <Text style={styles.sectionDescription}>
              Review and edit lesson titles before creating your course
            </Text>

            <View style={styles.lessonsList}>
              {lessons.map((lesson, index) => (
                <View key={index} style={styles.lessonItem}>
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.lessonTitleInput}
                    value={lesson.title}
                    onChangeText={(text) => handleLessonTitleChange(index, text)}
                    placeholder="Lesson title"
                    placeholderTextColor="#C7C7CC"
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateCourse}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Create Course</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  inputContainer: {
    marginTop: 8,
  },
  urlInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
    padding: 48,
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    maxHeight: 400,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  previewBodyScroll: {
    maxHeight: 300,
  },
  previewBody: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  lessonsList: {
    gap: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lessonTitleInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
});
