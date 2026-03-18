import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const UnsubscribeButton = ({ unsubscribe }) => {
  return (
    <TouchableOpacity onPress={unsubscribe} style={{ padding: 10, backgroundColor: '#ff0000' }}>
      <Text style={{ color: '#ffffff' }}>Unsubscribe</Text>
    </TouchableOpacity>
  );
};

export default UnsubscribeButton;
