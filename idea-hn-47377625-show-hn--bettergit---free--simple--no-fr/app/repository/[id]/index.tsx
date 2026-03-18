import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRepositoryStore } from '@/stores/useRepositoryStore';
import { CloneService } from '@/services/git/CloneService';
import { GitService } from '@/services/git/GitService';
import { useState, useEffect } from 'react';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
}

export default function RepositoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const repository = useRepositoryStore((state) =>
    state.repositories.find((r) => r.id === id)
  );
  const updateRepository = useRepositoryStore((state) => state.updateRepository);
  const setCloneProgress = useRepositoryStore((state) => state.setCloneProgress);
  const setCloned = useRepositoryStore((state) => state.setCloned);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    if (repository?.isCloned) {
      loadFiles();
    }
  }, [repository?.isCloned]);

  const loadFiles = async () => {
    if (!repository) return;

    setIsLoading(true);
    try {
      const fileNames = await GitService.listFiles(repository.id);
      const fileItems: FileItem[] = await Promise.all(
        fileNames.map(async (name) => {
          const info = await GitService.getFileInfo(repository.id, name);
          return {
            name,
            type: info.isDirectory ? 'directory' : 'file',
            path: name,
          };
        })
      );
      setFiles(fileItems);
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert('Error', 'Failed to load repository files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClone = async () => {
    if (!repository) return;

    setIsCloning(true);
    try {
      await CloneService.cloneRepository({
        url: repository.url,
        repoId: repository.id,
        onProgress: (progress) => {
          const percent = progress.total > 0 
            ? Math.round((progress.loaded / progress.total) * 100)
            : 0;
          setCloneProgress(repository.id, percent);
        },
      });
      setCloned(repository.id, true);
      await loadFiles();
    } catch (error) {
      console.error('Clone error:', error);
      Alert.alert('Clone Failed', 'Failed to clone repository. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  const handleFilePress = async (file: FileItem) => {
    if (file.type === 'directory') {
      // TODO: Navigate to subdirectory
      Alert.alert('Directory', `Opening ${file.name} - subdirectory navigation coming soon`);
    } else {
      // TODO: Navigate to file viewer
      Alert.alert('File', `Opening ${file.name} - file viewer coming soon`);
    }
  };

  if (!repository) {
    return (
      <View style={styles.container}>
        <Text>Repository not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {repository.name}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.description}>{repository.description}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star-outline" size={20} color="#757575" />
              <Text style={styles.statValue}>{repository.stars}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="source-fork" size={20} color="#757575" />
              <Text style={styles.statValue}>{repository.forks}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="circle"
                size={16}
                color={repository.languageColor}
              />
              <Text style={styles.statValue}>{repository.language}</Text>
            </View>
          </View>
        </View>

        {!repository.isCloned && !isCloning && (
          <TouchableOpacity
            style={styles.cloneButton}
            onPress={handleClone}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="download" size={20} color="#fff" />
            <Text style={styles.cloneButtonText}>Clone Repository</Text>
          </TouchableOpacity>
        )}

        {isCloning && (
          <View style={styles.cloningCard}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.cloningText}>Cloning repository...</Text>
            {repository.cloneProgress !== undefined && (
              <Text style={styles.progressText}>{repository.cloneProgress}%</Text>
            )}
          </View>
        )}

        {repository.isCloned && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Files</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
              </View>
            ) : files.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No files found</Text>
              </View>
            ) : (
              files.map((file) => (
                <TouchableOpacity
                  key={file.path}
                  style={styles.fileItem}
                  onPress={() => handleFilePress(file)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={file.type === 'directory' ? 'folder' : 'file-document-outline'}
                    size={24}
                    color={file.type === 'directory' ? '#FFA726' : '#757575'}
                  />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileDetail}>
                      {file.type === 'directory' ? 'Folder' : 'File'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#bdbdbd"
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
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
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statValue: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 6,
  },
  cloneButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  cloneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cloningCard: {
    backgroundColor: '#fff',
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cloningText: {
    fontSize: 16,
    color: '#212121',
    marginTop: 16,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    padding: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
    marginBottom: 2,
  },
  fileDetail: {
    fontSize: 12,
    color: '#9e9e9e',
  },
});
