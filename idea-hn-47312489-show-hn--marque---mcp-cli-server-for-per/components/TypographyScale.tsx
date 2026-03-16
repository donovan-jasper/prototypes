import React from 'react';
import { View, Text } from 'react-native';

const TypographyScale = ({ typography }) => {
  return (
    <View>
      {typography.scale.map((size, index) => (
        <View key={index} className="mb-2">
          <Text style={{ fontSize: size }}>{`Heading ${index + 1}`}</Text>
          <Text className="text-xs text-gray-500">{`${size}px`}</Text>
        </View>
      ))}
    </View>
  );
};

export default TypographyScale;
