import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { getFeedback } from '../../lib/feedback';

export default function FeedbackInbox() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const feedbackData = await getFeedback();
      setFeedback(feedbackData);
    };
    fetchFeedback();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <Text>{item.comment}</Text>
      <Text style={styles.ideaTitle}>{item.ideaTitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={feedback}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  feedbackItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  ideaTitle: {
    fontWeight: 'bold',
    marginTop: 5,
  },
});
