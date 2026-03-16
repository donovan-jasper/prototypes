import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import MessageItem from '../../components/MessageItem';
import { useMessageStore } from '../../lib/store/useMessageStore';

export default function InboxScreen() {
  const { messages, fetchMessages } = useMessageStore();

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MessageItem message={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    paddingBottom: 16,
  },
});
