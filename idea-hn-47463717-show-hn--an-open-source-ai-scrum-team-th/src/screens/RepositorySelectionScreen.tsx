import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Octokit } from '@octokit/rest';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
}

const RepositorySelectionScreen: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const token = await AsyncStorage.getItem('githubToken');
        if (!token) {
          throw new Error('No GitHub token found');
        }

        const octokit = new Octokit({ auth: token });
        const response = await octokit.request('GET /user/repos', {
          type: 'owner',
          sort: 'updated',
          per_page: 100,
        });

        setRepositories(response.data);
        setFilteredRepositories(response.data);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        Alert.alert('Error', 'Could not fetch repositories. Please try again.');
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredRepositories(repositories);
    } else {
      const filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredRepositories(filtered);
    }
  }, [searchQuery, repositories]);

  const handleRepositorySelect = async (repo: Repository) => {
    try {
      await AsyncStorage.setItem('selectedRepository', repo.full_name);
      navigation.navigate('IssueList', { repo: repo.full_name });
    } catch (error) {
      console.error('Error saving repository:', error);
      Alert.alert('Error', 'Could not save repository selection. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading your repositories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Repository</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search repositories..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCapitalize="none"
      />

      {filteredRepositories.length === 0 && searchQuery !== '' ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No repositories found matching "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRepositories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.repoItem}
              onPress={() => handleRepositorySelect(item)}
              activeOpacity={0.7}
            >
              <View style={styles.repoHeader}>
                <Text style={styles.repoName}>{item.name}</Text>
                <View style={styles.starsContainer}>
                  <Text style={styles.starsText}>⭐ {item.stargazers_count}</Text>
                </View>
              </View>
              {item.description && (
                <Text style={styles.repoDescription}>{item.description}</Text>
              )}
              <Text style={styles.repoFullName}>{item.full_name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>You don't have any repositories yet.</Text>
              <Text style={styles.emptyListSubtext}>Create one on GitHub to get started.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  searchBar: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  repoItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  repoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  repoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  starsContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  starsText: {
    fontSize: 14,
    color: '#666',
  },
  repoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  repoFullName: {
    fontSize: 12,
    color: '#999',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyList: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyListSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default RepositorySelectionScreen;
