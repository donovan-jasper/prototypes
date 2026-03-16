import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ApplicationBuilder = () => {
  return (
    <View style={styles.container}>
      <Text>Application Builder</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ApplicationBuilder;
