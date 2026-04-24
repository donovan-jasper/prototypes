import React from 'react';
import { FlatList, Text, View } from 'react-native';

const MessageList = ({ messages }) => {
  const renderItem = ({ item }) => (
    <View style={{ padding: 10 }}>
      <Text>{item.text}</Text>
    </View>
  );

  return (
    <FlatList
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

export default MessageList;
