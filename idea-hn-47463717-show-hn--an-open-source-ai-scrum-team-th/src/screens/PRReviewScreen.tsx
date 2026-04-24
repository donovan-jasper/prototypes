import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import PRReview from '../components/PRReview';

const PRReviewScreen: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const route = useRoute();
  const { pr } = route.params as { pr: any };

  const handleApprove = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('PR Approved!');
    }, 1000);
  };

  const handleReject = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('PR Rejected!');
    }, 1000);
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
