import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

export default function QueryEditor({ value, onChangeText }) {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        multiline
        numberOfLines={10}
        value={value}
        onChangeText={onChangeText}
        style={styles.editor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editor: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
