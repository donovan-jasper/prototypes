import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileSystemService } from '@/services/storage/FileSystemService';
import { DatabaseService } from '@/services/storage/DatabaseService';
import { SyntaxHighlighter } from '@/components/SyntaxHighlighter';
import { Repository } from '@/types/repository';

export default function FileViewerScreen() {
  const { id: repoId, path: filePath, repoPath } = useLocalSearchParams<{
    id: string;
    path: string;
    repoPath: string;
  }>();
  const router = useRouter();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState('text');

  useEffect(() => {
    const loadFile = async () => {
      try {
        if (!repoId || !filePath || !repoPath) {
          throw new Error('Missing required parameters');
        }

        const repo = await DatabaseService.getRepository(repoId as string);
        if (!repo) {
          throw new Error('Repository not found');
        }

        setRepository(repo);

        const fullPath = `${repoPath}/${filePath}`;
        const content = await FileSystemService.readFile(fullPath);
        setFileContent(content);

        // Determine file type for syntax highlighting
        const extension = filePath.split('.').pop()?.toLowerCase();
        if (['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'md', 'py', 'java', 'c', 'cpp', 'rb', 'php'].includes(extension || '')) {
          setFileType(extension || 'text');
        } else {
          setFileType('text');
        }
      } catch (err) {
        console.error('Error loading file:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [repoId, filePath, repoPath]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading file...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2196F3" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {filePath?.split('/').pop() || 'File'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.pathContainer}>
        <Text style={styles.pathText} numberOfLines={1}>
          {filePath}
        </Text>
      </View>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.content}>
        {fileType === 'text' ? (
          <Text style={styles.textContent}>{fileContent}</Text>
        ) : (
          <SyntaxHighlighter
            code={fileContent}
            language={fileType}
            style={styles.codeContent}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  pathContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pathText: {
    fontSize: 14,
    color: '#757575',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  textContent: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  codeContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
