import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FileSystemService } from '@/services/storage/FileSystemService';
import { DatabaseService } from '@/services/storage/DatabaseService';
import { Repository } from '@/types/repository';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
}

export default function RepositoryFilesScreen() {
  const { id: repoId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepository = async () => {
      try {
        if (!repoId) {
          throw new Error('Repository ID is required');
        }

        const repo = await DatabaseService.getRepository(repoId as string);
        if (!repo) {
          throw new Error('Repository not found');
        }

        setRepository(repo);
        await loadFiles(repo.path);
      } catch (err) {
        console.error('Error loading repository:', err);
        setError(err instanceof Error ? err.message : 'Failed to load repository');
      } finally {
        setLoading(false);
      }
    };

    loadRepository();
  }, [repoId]);

  const loadFiles = async (basePath: string, path = '') => {
    try {
      setLoading(true);
      setError(null);

      const fullPath = `${basePath}${path}`;
      const items = await FileSystemService.listDirectory(fullPath);

      const fileItems: FileItem[] = items.map(item => ({
        name: item.name,
        path: `${path}/${item.name}`.replace(/^\//, ''),
        isDirectory: item.isDirectory,
        size: item.size,
        lastModified: item.lastModified
      }));

      // Sort directories first, then files
      fileItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setFiles(fileItems);
      setCurrentPath(path);
    } catch (err) {
      console.error('Error loading files:', err);
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: FileItem) => {
    if (item.isDirectory) {
      loadFiles(repository!.path, item.path);
    } else {
      router.push({
        pathname: `/repository/${repoId}/file/${encodeURIComponent(item.path)}`,
        params: { repoPath: repository!.path }
      });
    }
  };

  const handleGoBack = () => {
    if (currentPath === '') {
      router.back();
      return;
    }

    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    loadFiles(repository!.path, parentPath);
  };

  const formatFileSize = (size?: number) => {
    if (!size) return '';

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading files...</Text>
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
          onPress={() => loadFiles(repository!.path, currentPath)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
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
          {repository?.name || 'Files'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.pathContainer}>
        <Text style={styles.pathText} numberOfLines={1}>
          {currentPath || '/'}
        </Text>
      </View>

      <FlatList
        data={files}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.fileItem}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.fileIcon}>
              <MaterialCommunityIcons
                name={item.isDirectory ? 'folder' : 'file-outline'}
                size={24}
                color={item.isDirectory ? '#FFC107' : '#757575'}
              />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.name}
              </Text>
              {!item.isDirectory && (
                <View style={styles.fileDetails}>
                  <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
                  {item.lastModified && (
                    <Text style={styles.fileDate}>{formatDate(item.lastModified)}</Text>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="folder-open-outline" size={48} color="#bdbdbd" />
            <Text style={styles.emptyText}>No files found</Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 4,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileSize: {
    fontSize: 12,
    color: '#757575',
    marginRight: 8,
  },
  fileDate: {
    fontSize: 12,
    color: '#757575',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
  },
});
