import React from 'react';
import { View, Text } from 'react-native';

const ConflictAlert = ({ message }) => {
  return (
    <View style={{ backgroundColor: 'red', padding: 10 }}>
      <Text style={{ color: 'white' }}>{message}</Text>
    </View>
  );
};

export default ConflictAlert;
