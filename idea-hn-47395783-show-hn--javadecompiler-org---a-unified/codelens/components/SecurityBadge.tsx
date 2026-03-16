import React from 'react';
import { View, Text } from 'react-native';

const SecurityBadge = ({ severity }) => {
  const getColor = () => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <View style={{ backgroundColor: getColor(), padding: 4, borderRadius: 4, marginTop: 4 }}>
      <Text style={{ color: 'white' }}>{severity}</Text>
    </View>
  );
};

export default SecurityBadge;
