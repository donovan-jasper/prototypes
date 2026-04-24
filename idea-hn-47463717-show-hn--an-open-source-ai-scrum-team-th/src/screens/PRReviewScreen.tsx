import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import PRReview from '../components/PRReview';

const PRReviewScreen: React.FC = () => {
  const [loading, setLoading] = React.useState<boolean>(false);

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
    <PRReview
      prTitle="Fix login bug"
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PRReviewScreen;
