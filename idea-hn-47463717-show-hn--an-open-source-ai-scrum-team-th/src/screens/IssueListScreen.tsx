import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import IssueList from '../components/IssueList';
import useGitHubIssues from '../hooks/useGitHubIssues';

const IssueListScreen: React.FC = () => {
  const { issues, loading } = useGitHubIssues('owner/repo');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <IssueList issues={issues} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IssueListScreen;
