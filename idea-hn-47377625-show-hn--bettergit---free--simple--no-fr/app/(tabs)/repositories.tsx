import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, Button } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRepositoryStore } from '@/stores/useRepositoryStore';
import { CloneService } from '@/services/git/CloneService';
import { useAuthStore } from '@/stores/useAuthStore';

export default function RepositoriesScreen() {
  const router = useRouter();
  const { repositories, loading, error, loadRepositories } = useRepositoryStore();
  const { authToken } = useAuthStore();
  const [isCloneModalVisible, setIsCloneModalVisible] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneProgress, setCloneProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');

  useEffect(() => {
    loadRepositories();
  }, []);

  const handleCloneRepository = async () => {
    if (!repoUrl.trim()) {
      Alert.alert('Error', 'Please enter a repository URL');
      return;
    }

    try {
      setIsCloning(true);
      setCloneProgress(0);
      setCurrentFile('');

      // Generate a simple repo ID from the URL
      const repoId = repoUrl.split('/').pop()?.replace('.git', '') || `repo-${Date.now()}`;

      await CloneService.cloneRepository({
        url: repoUrl,
        repoId,
        authToken,
        onProgress: (progress) => {
          setCloneProgress(progress.percent);
          if (progress.currentFile) {
            setCurrentFile(progress.currentFile);
          }
        }
      });

      Alert.alert('Success', 'Repository cloned successfully!');
      setIsCloneModalVisible(false);
      setRepoUrl('');
      await loadRepositories();
    } catch (error) {
      console.error('Clone error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to clone repository');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeleteRepository = (repoId: string) => {
    Alert.alert(
      'Delete Repository',
      'Are you sure you want to delete this repository? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CloneService.deleteRepository(repoId);
              await loadRepositories();
              Alert.alert('Success', 'Repository deleted successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete repository');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading repositories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={loadRepositories} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Repositories</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCloneModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {repositories.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="source-repository" size={64} color="#bdbdbd" />
          <Text style={styles.emptyText}>No repositories cloned yet</Text>
          <Text style={styles.emptySubtext}>Clone your first repository to get started</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setIsCloneModalVisible(true)}
          >
            <Text style={styles.emptyButtonText}>Clone Repository</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={repositories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.repoCard}
              onPress={() => router.push(`/repository/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.repoHeader}>
                <MaterialCommunityIcons
                  name="source-repository"
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.repoName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRepository(item.id)}
                >
                  <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
              <Text style={styles.repoDescription} numberOfLines={2}>
                {item.description || 'No description available'}
              </Text>
              <View style={styles.repoStats}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="star-outline" size={16} color="#757575" />
                  <Text style={styles.statText}>{item.stars || 0}</Text>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="source-fork" size={16} color="#757575" />
                  <Text style={styles.statText}>{item.forks || 0}</Text>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="circle" size={12} color={item.languageColor || '#6a737d'} />
                  <Text style={styles.statText}>{item.language || 'Unknown'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={isCloneModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCloneModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clone Repository</Text>

            {isCloning ? (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.progressText}>Cloning repository...</Text>
                <Text style={styles.progressPercent}>{cloneProgress}%</Text>
                {currentFile && (
                  <Text style={styles.currentFileText} numberOfLines={1}>
                    {currentFile}
                  </Text>
                )}
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="https://github.com/username/repository.git"
                  value={repoUrl}
                  onChangeText={setRepoUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <View style={styles.buttonContainer}>
                  <Button
                    title="Cancel"
                    onPress={() => setIsCloneModalVisible(false)}
                    color="#757575"
                  />
                  <Button
                    title="Clone"
                    onPress={handleCloneRepository}
                    disabled={!repoUrl.trim()}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  repoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  repoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  repoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 8,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  repoDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  repoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212121',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  progressText: {
    fontSize: 16,
    color: '#212121',
    marginTop: 16,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 8,
  },
  currentFileText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    maxWidth: '100%',
  },
});
