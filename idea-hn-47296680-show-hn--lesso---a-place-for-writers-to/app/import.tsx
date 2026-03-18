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
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { useCourseStore } from '../store/courseStore';

type TabType = 'url' | 'file' | 'ai';

interface ExtractedContent {
  title: string;
  body: string;
  sections: string[];
}

export default function ImportScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  const createCourse = useCourseStore((state) => state.createCourse);
  const addLesson = useCourseStore((state) => state.addLesson);

  const extractContentFromURL = async (urlString: string): Promise<ExtractedContent> => {
    const response = await fetch(urlString);
    const html = await response.text();

    // Extract title from <h1> or <title>
    let title = '';
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match) {
      title = h1Match[1].replace(/<[^>]*>/g, '').trim();
    } else {
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      }
    }

    // Extract body from <article> or all <p> tags
    let body = '';
    const articleMatch = html.match(/<article[^>]*>(.*?)<\/article>/is);
    if (articleMatch) {
      body = articleMatch[1];
    } else {
      const pMatches = html.match(/<p[^>]*>.*?<\/p>/gi);
      if (pMatches) {
        body = pMatches.join('\n\n');
      }
    }

    // Clean HTML tags
    body = body.replace(/<[^>]*>/g, '').trim();
    body = body.replace(/&nbsp;/g, ' ');
    body = body.replace(/&amp;/g, '&');
    body = body.replace(/&lt;/g, '<');
    body = body.replace(/&gt;/g, '>');
    body = body.replace(/&quot;/g, '"');

    // Split into sections by paragraphs
    const sections = body
      .split(/\n\n+/)
      .filter((s) => s.trim().length > 50)
      .slice(0, 10);

    return { title, body, sections };
  };

  const handleURLImport = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const content = await extractContentFromURL(url);
      if (!content.title || !content.body) {
        throw new Error('Could not extract content from URL');
      }
      setExtractedContent(content);
    } catch (error) {
      Alert.alert('Error', 'Failed to extract content from URL. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async () => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/markdown'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);

      // Extract title from filename
      const title = file.name.replace(/\.(txt|md)$/i, '');

      // Split into sections by double newlines or markdown headers
      const sections = content
        .split(/\n\n+|^#{1,3}\s+/m)
        .filter((s) => s.trim().length > 50)
        .slice(0, 10);

      setExtractedContent({
        title,
        body: content,
        sections,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to read file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    if (!extractedContent) return;

    createCourse({
      title: extractedContent.title,
      description: extractedContent.body.substring(0, 200) + '...',
      published: false,
    });

    const courses = useCourseStore.getState().courses;
    const newCourse = courses[courses.length - 1];

    // Create lessons from sections
    extractedContent.sections.forEach((section, index) => {
      addLesson(newCourse.id, {
        title: `Lesson ${index + 1}`,
        content: section,
        order: index,
      });
    });

    Alert.alert(
      'Success',
      `Created course with ${extractedContent.sections.length} lessons`,
      [
        {
          text: 'View Course',
          onPress: () => router.push(`/course/${newCourse.id}`),
        },
      ]
    );
  };

  const renderURLTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.instructions}>
        Paste a URL to extract article content and create lessons
      </Text>
      <TextInput
        style={styles.urlInput}
        placeholder="https://example.com/article"
        placeholderTextColor="#C7C7CC"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
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
    </View>
  );

  const renderFileTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.instructions}>
        Upload a .txt or .md file to create lessons from its content
      </Text>
      <TouchableOpacity
        style={styles.fileButton}
        onPress={handleFileImport}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <>
            <Ionicons name="document-outline" size={48} color="#007AFF" />
            <Text style={styles.fileButtonText}>Choose File</Text>
            <Text style={styles.fileButtonSubtext}>Supports .txt and .md files</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAITab = () => (
    <View style={styles.tabContent}>
      <View style={styles.comingSoon}>
        <Ionicons name="sparkles-outline" size={64} color="#C7C7CC" />
        <Text style={styles.comingSoonTitle}>AI Generation</Text>
        <Text style={styles.comingSoonText}>
          Coming soon: Generate course content from a topic or description using AI
        </Text>
      </View>
    </View>
  );

  const renderPreview = () => {
    if (!extractedContent) return null;

    return (
      <View style={styles.preview}>
        <View style={styles.previewHeader}>
          <Ionicons name="eye-outline" size={24} color="#007AFF" />
          <Text style={styles.previewTitle}>Preview</Text>
        </View>

        <View style={styles.previewContent}>
          <Text style={styles.previewCourseTitle}>{extractedContent.title}</Text>
          <Text style={styles.previewDescription} numberOfLines={3}>
            {extractedContent.body.substring(0, 200)}...
          </Text>

          <View style={styles.lessonSuggestions}>
            <Text style={styles.suggestionsTitle}>
              Suggested Lessons ({extractedContent.sections.length})
            </Text>
            {extractedContent.sections.slice(0, 5).map((section, index) => (
              <View key={index} style={styles.lessonPreview}>
                <View style={styles.lessonNumber}>
                  <Text style={styles.lessonNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.lessonPreviewText} numberOfLines={2}>
                  {section.substring(0, 100)}...
                </Text>
              </View>
            ))}
            {extractedContent.sections.length > 5 && (
              <Text style={styles.moreText}>
                +{extractedContent.sections.length - 5} more lessons
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.createCourseButton}
            onPress={handleCreateCourse}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.createCourseButtonText}>Create Course from Import</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
            URL
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
            File
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'ai' && styles.activeTab]}
          onPress={() => setActiveTab('ai')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="sparkles-outline"
            size={20}
            color={activeTab === 'ai' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>
            AI Generate
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'url' && renderURLTab()}
        {activeTab === 'file' && renderFileTab()}
        {activeTab === 'ai' && renderAITab()}
        {renderPreview()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
    paddingVertical: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 20,
  },
  urlInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fileButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 12,
  },
  fileButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  fileButtonSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  preview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  previewContent: {
    padding: 16,
  },
  previewCourseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 20,
  },
  lessonSuggestions: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  lessonPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  lessonNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lessonPreviewText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  moreText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  createCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  createCourseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
