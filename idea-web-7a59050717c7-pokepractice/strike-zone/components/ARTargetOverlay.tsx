import React from 'react';
import { View, StyleSheet } from 'react-native';

const ARTargetOverlay = ({ targets }) => {
  return (
    <View style={styles.container}>
      {targets.map((target, index) => (
        <View
          key={index}
          style={[
            styles.target,
            {
              left: `${target.x * 100}%`,
              top: `${target.y * 100}%`,
              width: `${target.radius * 100}%`,
              height: `${target.radius * 100}%`,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  target: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    borderRadius: 50,
  },
});

export default ARTargetOverlay;
