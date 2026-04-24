import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Octokit } from '@octokit/rest';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
}

const RepositorySelectionScreen: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
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
      } catch (error) {
        console.error('Error fetching repositories:', error);
        Alert.alert('Error', 'Could not fetch repositories');
        navigation.navigate('Login');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  const handleRepositorySelect = (repo: Repository) => {
    navigation.navigate('IssueList', { repo: repo.full_name });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your repositories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Repository</Text>
      <FlatList
        data={repositories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.repoItem}
            onPress={() => handleRepositorySelect(item)}
          >
            <Text style={styles.repoName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.repoDescription}>{item.description}</Text>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
  repoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  repoDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default RepositorySelectionScreen;
