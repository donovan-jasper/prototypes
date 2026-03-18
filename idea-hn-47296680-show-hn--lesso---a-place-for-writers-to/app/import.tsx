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
import * as DocumentPicker from 'expo-document-picker';
import { extractContentFromURL, convertPDFToText } from '../lib/import';
import { useCourseStore } from '../store/courseStore';

type Tab = 'url' | 'file' | 'bulk';

interface ExtractedLesson {
  title: string;
  content: string;
}

export default function ImportScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedLessons, setExtractedLessons] = useState<ExtractedLesson[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  
  const createCourse = useCourseStore((state) => state.createCourse);
  const addLesson = useCourseStore((state) => state.addLesson);

  const handleURLImport = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const content = await extractContentFromURL(url.trim());
      setExtractedLessons([
        {
          title: content.title,
          content: content.body,
        },
      ]);
      setCourseTitle(content.title);
    } catch (error) {
      Alert.alert('Import Failed', 'Could not extract content from URL. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async () => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const file = result.assets[0];
      const content = await convertPDFToText(file.uri);
      
      setExtractedLessons([
        {
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: content,
        },
      ]);
      setCourseTitle(file.name.replace(/\.[^/.]+$/, ''));
    } catch (error) {
      Alert.alert('Import Failed', 'Could not read file content. Please try a different file.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    if (extractedLessons.length === 0) {
      Alert.alert('Error', 'No content to import');
      return;
    }

    const finalTitle = courseTitle.trim() || 'Imported Course';
    
    createCourse({
      title: finalTitle,
      description: `Imported from ${activeTab === 'url' ? 'URL' : 'file'}`,
      published: false,
    });

    const courses = useCourseStore.getState().courses;
    const newCourse = courses[courses.length - 1];

    extractedLessons.forEach((lesson, index) => {
      addLesson(newCourse.id, {
        title: lesson.title,
        content: lesson.content,
        order: index,
      });
    });

    Alert.alert(
      'Success',
      `Course created with ${extractedLessons.length} lesson${extractedLessons.length > 1 ? 's' : ''}`,
      [
        {
          text: 'View Course',
          onPress: () => router.push(`/course/${newCourse.id}`),
        },
      ]
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'url') {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.label}>Paste URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.substack.com/p/article"
            placeholderTextColor="#C7C7CC"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <TouchableOpacity
            style={styles.importButton}
            onPress={handleURLImport}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <Text style={styles.importButtonText}>Extract Content</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.hint}>
            Supports Substack, Medium, and most blog platforms
          </Text>
        </View>
      );
    }

    if (activeTab === 'file') {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.label}>Upload Document</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleFileImport}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={48} color="#007AFF" />
                <Text style={styles.uploadButtonText}>Choose File</Text>
                <Text style={styles.uploadButtonHint}>PDF or Word documents</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.comingSoon}>
          <Ionicons name="construct-outline" size={64} color="#C7C7CC" />
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Bulk import from Google Drive and Dropbox will be available in a future update
          </Text>
        </View>
      </View>
    );
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
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'url' && styles.tabActive]}
          onPress={() => setActiveTab('url')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="link-outline"
            size={20}
            color={activeTab === 'url' ? '#007AFF' : '#C7C7CC'}
          />
          <Text style={[styles.tabText, activeTab === 'url' && styles.tabTextActive]}>URL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'file' && styles.tabActive]}
          onPress={() => setActiveTab('file')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="document-outline"
            size={20}
            color={activeTab === 'file' ? '#007AFF' : '#C7C7CC'}
          />
          <Text style={[styles.tabText, activeTab === 'file' && styles.tabTextActive]}>File</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bulk' && styles.tabActive]}
          onPress={() => setActiveTab('bulk')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="cloud-outline"
            size={20}
            color={activeTab === 'bulk' ? '#007AFF' : '#C7C7CC'}
          />
          <Text style={[styles.tabText, activeTab === 'bulk' && styles.tabTextActive]}>Bulk</Text>
        </TouchableOpacity>
      </View>

      {renderTabContent()}

      {extractedLessons.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview</Text>
          {extractedLessons.map((lesson, index) => (
            <View key={index} style={styles.previewLesson}>
              <Text style={styles.previewLessonTitle}>{lesson.title}</Text>
              <Text style={styles.previewLessonContent}>{lesson.content}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.createCourseButton}
            onPress={handleCreateCourse}
            activeOpacity={0.8}
          >
            <Text style={styles.createCourseButtonText}>Create Course from Import</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7CC',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 24,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C7C7CC',
  },
  tab: {
    padding: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#C7C7CC',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  tabContent: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#C7C7CC',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  importButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  importButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  hint: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  uploadButtonHint: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
  comingSoon: {
    padding: 16,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#C7C7CC',
  },
  previewContainer: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewLesson: {
    marginBottom: 16,
  },
  previewLessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewLessonContent: {
    fontSize: 14,
    color: '#C7C7CC',
  },
  createCourseButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  createCourseButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
