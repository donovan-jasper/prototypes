import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import UnsubscribeButton from './UnsubscribeButton';

const SubscriptionList = ({ subscriptions, unsubscribe }) => {
  return (
    <FlatList
      data={subscriptions}
      renderItem={({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
          <Text>{item.name}</Text>
          <UnsubscribeButton unsubscribe={() => unsubscribe(item.id)} />
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default SubscriptionList;
