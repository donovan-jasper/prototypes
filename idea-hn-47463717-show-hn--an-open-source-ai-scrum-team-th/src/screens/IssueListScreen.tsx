import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IssueList from '../components/IssueList';
import useGitHubIssues from '../hooks/useGitHubIssues';

const IssueListScreen: React.FC = () => {
  const { issues, loading } = useGitHubIssues('owner/repo');
  const navigation = useNavigation();

  const handlePRSelect = (pr: any) => {
    navigation.navigate('PRReview', { pr });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <IssueList issues={issues} onPRSelect={handlePRSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IssueListScreen;
