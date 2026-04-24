import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface PRReviewProps {
  prTitle: string;
  onApprove: () => void;
  onReject: () => void;
}

const PRReview: React.FC<PRReviewProps> = ({ prTitle, onApprove, onReject }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.prTitle}>{prTitle}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Approve" onPress={onApprove} />
        <Button title="Reject" onPress={onReject} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  prTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default PRReview;
