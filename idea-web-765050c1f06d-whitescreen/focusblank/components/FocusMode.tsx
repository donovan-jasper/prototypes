import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

const FocusMode = ({ mode, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.container, { backgroundColor: mode.color }]}>
        <Text style={styles.text}>{mode.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FocusMode;
