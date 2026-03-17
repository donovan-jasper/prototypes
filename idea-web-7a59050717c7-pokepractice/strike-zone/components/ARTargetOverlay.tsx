import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

const ARTargetOverlay = ({ targets, onHit }) => {
  return (
    <View style={styles.container}>
      {targets.map((target, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.target,
            {
              left: `${(target.x + 1) * 50}%`,
              top: `${(target.y + 1) * 50}%`,
            },
          ]}
          onPress={() => onHit(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  target: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default ARTargetOverlay;
