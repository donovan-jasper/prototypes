import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import PRReview from '../components/PRReview';
import useGitHubPRs from '../hooks/useGitHubPRs';

interface PR {
  id: number;
  title: string;
  // Add other PR properties as needed
}

const PRReviewScreen: React.FC = () => {
  const route = useRoute();
  const { pr } = route.params as { pr: PR };
  const { loading, approvePR, rejectPR } = useGitHubPRs();

  const handleApprove = async () => {
    const result = await approvePR(pr.id);
    Alert.alert('Success', result.message);
  };

  const handleReject = async () => {
    const result = await rejectPR(pr.id);
    Alert.alert('Success', result.message);
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
      <Text style={styles.title}>{pr.title}</Text>
      <PRReview
        prTitle={pr.title}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PRReviewScreen;
