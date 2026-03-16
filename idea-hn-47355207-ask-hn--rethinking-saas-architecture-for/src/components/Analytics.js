import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Analytics = () => {
  return (
    <View style={styles.container}>
      <Text>Analytics</Text>
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

export default Analytics;
