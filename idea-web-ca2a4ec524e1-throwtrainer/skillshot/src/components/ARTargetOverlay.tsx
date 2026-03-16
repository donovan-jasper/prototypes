import React from 'react';
import { View, StyleSheet } from 'react-native';

const ARTargetOverlay = ({ position }) => {
  return (
    <View
      style={[
        styles.target,
        {
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  target: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ARTargetOverlay;
