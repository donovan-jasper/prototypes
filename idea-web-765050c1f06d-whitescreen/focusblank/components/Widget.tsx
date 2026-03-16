import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

const Widget = ({ widget, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Text style={styles.text}>{widget.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 18,
  },
});

export default Widget;
