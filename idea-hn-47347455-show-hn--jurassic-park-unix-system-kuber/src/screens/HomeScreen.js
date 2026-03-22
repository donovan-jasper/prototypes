import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MonitoringScreen from '../components/MonitoringScreen';
import ThemeSelector from '../components/ThemeSelector';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <MonitoringScreen />
      <ThemeSelector />
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

export default HomeScreen;
