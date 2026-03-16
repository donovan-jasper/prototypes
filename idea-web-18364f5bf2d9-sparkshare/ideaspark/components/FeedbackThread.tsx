import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FeedbackThread({ feedback }) {
  return (
    <View style={styles.container}>
      {feedback.map((item) => (
        <View key={item.id} style={styles.feedbackItem}>
          <Text>{item.comment}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  feedbackItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
