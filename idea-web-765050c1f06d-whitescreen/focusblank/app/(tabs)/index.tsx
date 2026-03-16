import React from 'react';
import { View, StyleSheet } from 'react-native';
import BlankCanvas from '../../components/BlankCanvas';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <BlankCanvas />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
